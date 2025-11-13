import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Filter, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  _id: string;
  transactionType: 'inquiry_fee' | 'success_fee' | 'subscription' | 'featured_ad';
  vehicleDetails?: string;
  amount: number;
  commission?: number;
  paymentStatus: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      if (!response.ok) throw new Error('Failed to load transactions');
      
      const data = await response.json();
      setTransactions(data.data || []);
      setFilteredTransactions(data.data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        (t.vehicleDetails?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (t.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.transactionType === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.paymentStatus === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inquiry_fee: 'Inquiry Fee',
      success_fee: 'Success Commission',
      subscription: 'Subscription',
      featured_ad: 'Featured Ad'
    };
    return labels[type] || type;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Vehicle/Description', 'Amount', 'Commission', 'Status', 'Method'];
    const rows = filteredTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      getTransactionTypeLabel(t.transactionType),
      t.vehicleDetails || t.notes || '-',
      `₹${t.amount.toLocaleString()}`,
      t.commission ? `₹${t.commission.toLocaleString()}` : '-',
      t.paymentStatus,
      t.paymentMethod
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = filteredTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);

  if (loading) {
    return (
      <DashboardLayout activeTab="transaction-history">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading transaction history...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="transaction-history">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">Track all your payments and commissions</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredTransactions.length} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalCommission.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                From successful vehicle sales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle, note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inquiry_fee">Inquiry Fee</SelectItem>
                  <SelectItem value="success_fee">Success Commission</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="featured_ad">Featured Ad</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {transactions.length === 0
                  ? 'No transactions yet'
                  : 'No transactions match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getTransactionTypeLabel(transaction.transactionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <span className="text-sm">
                            {transaction.vehicleDetails || transaction.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.commission ? (
                            <span className="text-primary font-medium">
                              ₹{transaction.commission.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(transaction.paymentStatus)}>
                            {transaction.paymentStatus.charAt(0).toUpperCase() +
                              transaction.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {transaction.paymentMethod.replace('_', ' ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}