import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Megaphone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useJobs } from '@/hooks/useApi';

export function JobManagement() {
  const navigate = useNavigate();
  
  // Fetch jobs from API
  const { jobs, loading } = useJobs({ pageSize: 100 });
  
  const handlePromoteToAd = (job: any) => {
    navigate('/admin/ads/create', {
      state: {
        adData: {
          title: job.title,
          advertiser: job.instituteName,
          type: 'image',
          mediaUrl: '', // Placeholder as jobs might not have a main image suitable for ads
          targetUrl: `/job/${job.id || job._id}`,
          placement: 'LIST_SIDEBAR',
          priority: 5,
          status: 'draft',
          budget: 100,
          pricingModel: 'fixed'
        }
      }
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Listings</h1>
          <p className="text-muted-foreground">
            Manage all job listings and promote them as ads
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {jobs.length === 0 && !loading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-2">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Institute</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id || job._id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.department}</div>
                    </TableCell>
                    <TableCell>{job.instituteName}</TableCell>
                    <TableCell>
                      {typeof job.location === 'string' ? job.location : 
                       (job.location?.city ? `${job.location.city}, ${job.location.state}` : 'N/A')}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{job.type}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePromoteToAd(job)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Promote to Ad"
                      >
                        <Megaphone className="w-4 h-4 mr-2" />
                        Promote
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
