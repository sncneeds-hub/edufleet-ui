import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, TrendingUp, Code2, ChevronRight, AlertCircle, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Task {
  number: number
  title: string
  priority: string
  timeline: string
  revenue: string
  effort: string
  phase: string
  description: string
  checklist: string[]
  status: 'completed' | 'in-progress' | 'pending' | 'unimplemented' | 'not-started'
  content: string
}

const TaskSelector = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<string>('PHASE 1')

  useEffect(() => {
    const fetchAndParseTasks = async () => {
      try {
        // Fetch the NEXT_REVENUE_TASKS.md file
        const response = await fetch('/NEXT_REVENUE_TASKS.md')
        const content = await response.text()
        
        // Parse tasks from the markdown content
        const parsedTasks = parseTasksFromMarkdown(content)
        setTasks(parsedTasks)
        
        // Set first task as selected by default
        if (parsedTasks.length > 0) {
          setSelectedTask(parsedTasks[0])
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAndParseTasks()
  }, [])

  const parseTasksFromMarkdown = (content: string): Task[] => {
    const tasks: Task[] = []
    
    // Extract Phase 1 tasks
    const phase1Regex = /### ✅ Task (\d+): ([^\n]+)\n\*\*Priority:\*\* ([^\n]+)\n\*\*Timeline:\*\* ([^\n]+)\n\*\*Revenue Impact:\*\* ([^\n]+)\n\*\*Effort:\*\* ([^\n]+)/g
    let match

    let taskCounter = 1
    while ((match = phase1Regex.exec(content)) !== null) {
      const taskNumber = parseInt(match[1])
      const title = match[2].trim()
      const priority = match[3].trim()
      const timeline = match[4].trim()
      const revenue = match[5].trim()
      const effort = match[6].trim()
      
      // Determine phase
      let phase = 'PHASE 1'
      if (taskNumber > 5) phase = 'PHASE 2'
      if (taskNumber > 7) phase = 'PHASE 3'
      if (taskNumber > 9) phase = 'PHASE 4'

      // Determine status
      let status: 'completed' | 'in-progress' | 'pending' | 'unimplemented' | 'not-started'
      if (taskNumber <= 3) {
        status = 'completed'
      } else if (taskNumber <= 5) {
        status = 'pending' // Ready for next implementation
      } else {
        status = 'unimplemented' // Future backlog
      }

      const task: Task = {
        number: taskNumber,
        title,
        priority,
        timeline,
        revenue,
        effort,
        phase,
        description: `${title} - Expected to generate ${revenue} monthly`,
        checklist: [],
        status,
        content: extractTaskContent(content, title)
      }

      tasks.push(task)
    }

    // Extract Phase 2+ tasks (with ⏭️ prefix)
    const otherPhasesRegex = /### ⏭️ Task (\d+): ([^\n]+)\n\*\*Priority:\*\* ([^\n]+)\n\*\*Timeline:\*\* ([^\n]+)\n\*\*Revenue Impact:\*\* ([^\n]+)\n\*\*Effort:\*\* ([^\n]+)/g

    while ((match = otherPhasesRegex.exec(content)) !== null) {
      const taskNumber = parseInt(match[1])
      const title = match[2].trim()
      const priority = match[3].trim()
      const timeline = match[4].trim()
      const revenue = match[5].trim()
      const effort = match[6].trim()

      // Determine phase
      let phase = 'PHASE 1'
      if (taskNumber > 5) phase = 'PHASE 2'
      if (taskNumber > 7) phase = 'PHASE 3'
      if (taskNumber > 9) phase = 'PHASE 4'

      const task: Task = {
        number: taskNumber,
        title,
        priority,
        timeline,
        revenue,
        effort,
        phase,
        description: `${title} - Expected to generate ${revenue} monthly`,
        checklist: [],
        status: 'unimplemented', // All ⏭️ marked tasks are in backlog
        content: extractTaskContent(content, title)
      }

      tasks.push(task)
    }

    return tasks.sort((a, b) => a.number - b.number)
  }

  const extractTaskContent = (content: string, taskTitle: string): string => {
    const taskStart = content.indexOf(`### ✅ Task`)
    if (taskStart === -1) return ''
    
    // Find the section for this task
    const searchStart = content.indexOf(taskTitle)
    if (searchStart === -1) return ''

    // Extract content until the next task
    const nextTaskStart = content.indexOf('### ', searchStart + 1)
    if (nextTaskStart === -1) {
      return content.substring(searchStart, searchStart + 1000)
    }

    return content.substring(searchStart, nextTaskStart)
  }

  const getPriorityColor = (priority: string) => {
    if (priority.includes('⭐⭐⭐⭐⭐')) return 'bg-red-100 text-red-800 border-red-300'
    if (priority.includes('⭐⭐⭐⭐')) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (priority.includes('⭐⭐⭐')) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-blue-100 text-blue-800 border-blue-300'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />
    if (status === 'in-progress') return <Clock className="h-5 w-5 text-blue-600" />
    if (status === 'pending') return <Clock className="h-5 w-5 text-blue-600" />
    return <AlertCircle className="h-5 w-5 text-gray-400" />
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'PHASE 1': return 'bg-primary/10 text-primary border-primary/20'
      case 'PHASE 2': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PHASE 3': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PHASE 4': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = []
    }
    acc[task.phase].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const phases = Object.keys(groupedTasks).sort()

  /**
   * Get next pending or unimplemented task for implementation
   * Prioritization order:
   * 1. First pending task (ready to implement next)
   * 2. First unimplemented task (backlog)
   * 3. First in-progress task (if no pending/unimplemented)
   * 4. First completed task (fallback)
   */
  const getNextTaskForImplementation = (): Task | null => {
    // Priority 1: pending tasks (Tasks 4-5)
    const pendingTask = tasks.find(task => task.status === 'pending')
    if (pendingTask) return pendingTask

    // Priority 2: unimplemented tasks (Tasks 6+)
    const unimplementedTask = tasks.find(task => task.status === 'unimplemented')
    if (unimplementedTask) return unimplementedTask

    // Priority 3: in-progress tasks
    const inProgressTask = tasks.find(task => task.status === 'in-progress')
    if (inProgressTask) return inProgressTask

    // Priority 4: completed tasks (fallback)
    return tasks.length > 0 ? tasks[0] : null
  }

  /**
   * Filter tasks by status - returns only pending or unimplemented tasks
   * Used for the \"Next Tasks\" view
   */
  const getPendingAndUnimplementedTasks = (): Task[] => {
    return tasks.filter(task => task.status === 'pending' || task.status === 'unimplemented')
  }

  /**
   * Get task count by status for display
   */
  const getTaskCountByStatus = (status: 'completed' | 'pending' | 'unimplemented' | 'in-progress'): number => {
    return tasks.filter(task => task.status === status).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground">Loading Revenue Tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                🚀 Revenue Task Selection
              </h1>
              <p className="text-muted-foreground mt-2">
                Choose a task to implement next and accelerate EduFleet's monetization
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">All Tasks</h2>
                <Badge variant="outline" className="ml-auto">
                  {tasks.length} tasks
                </Badge>
              </div>

              <Tabs
                value={activePhase}
                onValueChange={setActivePhase}
                className="w-full"
              >
                <TabsList className="grid w-full gap-2 h-auto flex-wrap bg-transparent">
                  {phases.map((phase) => (
                    <TabsTrigger
                      key={phase}
                      value={phase}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {phase}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {phases.map((phase) => (
                  <TabsContent key={phase} value={phase} className="space-y-3">
                    {groupedTasks[phase]?.map((task) => (
                      <Card
                        key={task.number}
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          selectedTask?.number === task.number
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground">
                                Task {task.number}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority.split(' ')[0]}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium line-clamp-2 text-foreground">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              💰 {task.revenue}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          {/* Task Details */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <Card className="p-8 border-2 shadow-xl sticky top-24">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {selectedTask.number}
                    </div>
                    <div className="flex-1">
                      <Badge className={`${getPhaseColor(selectedTask.phase)} border mb-2`}>
                        {selectedTask.phase}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        {selectedTask.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-lg mb-6">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-secondary/50 rounded-lg border">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Monthly Revenue
                    </div>
                    <p className="text-xl font-bold text-primary">{selectedTask.revenue}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      Timeline
                    </div>
                    <p className="text-xl font-bold text-primary">{selectedTask.timeline}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Code2 className="h-4 w-4 text-primary" />
                      Effort Level
                    </div>
                    <p className="text-xl font-bold text-primary">{selectedTask.effort}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      Priority: {selectedTask.priority.split(' ')[0]}
                    </div>
                    <p className="text-xl font-bold text-primary">{selectedTask.priority}</p>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>📋 Task Details</span>
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto text-sm text-muted-foreground space-y-3">
                    <p>
                      This task is part of {selectedTask.phase} and will take approximately{' '}
                      <span className="font-semibold text-foreground">{selectedTask.timeline}</span> to
                      implement.
                    </p>
                    <p>
                      Expected revenue impact:{' '}
                      <span className="font-semibold text-primary">{selectedTask.revenue}</span>
                    </p>
                    <p>
                      Development effort:{' '}
                      <span className="font-semibold text-foreground">{selectedTask.effort}</span>
                    </p>
                    <div className="pt-2 border-t">
                      <p className="font-semibold text-foreground mb-2">Status: {selectedTask.status}</p>
                      <p className="text-xs">
                        {selectedTask.status === 'completed'
                          ? '✅ COMPLETED - Successfully implemented'
                          : selectedTask.status === 'in-progress'
                          ? '🔄 IN PROGRESS - Currently being worked on'
                          : selectedTask.status === 'pending'
                          ? '⚡ PENDING - Ready for next implementation'
                          : selectedTask.status === 'unimplemented'
                          ? '📋 UNIMPLEMENTED - Queued in backlog'
                          : '⏳ NOT STARTED - Not yet queued'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      // Store selected task in localStorage
                      localStorage.setItem('selectedTask', JSON.stringify(selectedTask))
                      navigate('/dashboard')
                    }}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Select This Task & Go to Dashboard
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Open NEXT_REVENUE_TASKS.md details in a new way
                      const phaseSection = document.getElementById(`phase-${selectedTask.phase}`)
                      if (phaseSection) {
                        phaseSection.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    View Full Details in Docs
                  </Button>
                </div>

                {/* Implementation Tip */}
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">💡 Tip:</span> Start with{' '}
                    <span className="font-semibold text-primary">Task 1 (Subscription Tiers UI)</span>
                    {selectedTask.number === 1
                      ? ' - Great choice! This is the best starting point for revenue generation.'
                      : ' first to build momentum and generate initial revenue.'}
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-8 border-2 h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Select a task to view details</p>
                  <p className="text-sm mt-2">Click any task on the left to see implementation details</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">📊 Revenue Projection</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 border-2">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Month 1</h3>
              <p className="text-2xl font-bold text-primary">₹5.7L</p>
              <p className="text-xs text-muted-foreground mt-2">Phase 1 & 2 Tasks</p>
            </Card>
            <Card className="p-6 border-2">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Month 2-3</h3>
              <p className="text-2xl font-bold text-primary">₹12.9L</p>
              <p className="text-xs text-muted-foreground mt-2">+ Phase 3 Tasks</p>
            </Card>
            <Card className="p-6 border-2">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Month 4-6</h3>
              <p className="text-2xl font-bold text-primary">₹30.2L</p>
              <p className="text-xs text-muted-foreground mt-2">+ Phase 4 Tasks</p>
            </Card>
            <Card className="p-6 border-2 bg-primary/5 border-primary/50">
              <h3 className="font-semibold text-sm text-primary mb-2">Year 1 Target</h3>
              <p className="text-2xl font-bold text-primary">₹1.37Cr</p>
              <p className="text-xs text-primary/70 mt-2">All phases implemented</p>
            </Card>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🎯 Recommended Quick Start</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            To maximize revenue with minimal effort, implement these tasks in order:
          </p>
          <ol className="space-y-3">
            {[
              {
                num: 1,
                title: 'Subscription Tiers UI Implementation',
                revenue: '₹2,69,949/month',
                days: '3-4 days'
              },
              {
                num: 2,
                title: 'Activate Featured Ads System',
                revenue: '₹1,01,932/month',
                days: '2-3 days'
              },
              {
                num: 3,
                title: 'Enhanced Revenue Dashboard',
                revenue: 'Tracking & Analytics',
                days: '2 days'
              }
            ].map((item) => (
              <li key={item.num} className="flex gap-4 p-3 bg-white/50 rounded-lg border">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.num}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.revenue} • ~{item.days}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Button
            size="lg"
            className="mt-6 gap-2"
            onClick={() => {
              const task1 = tasks.find((t) => t.number === 1)
              if (task1) {
                setSelectedTask(task1)
                localStorage.setItem('selectedTask', JSON.stringify(task1))
              }
            }}
          >
            <CheckCircle className="h-5 w-5" />
            Start with Task 1 - Subscription Tiers UI
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskSelector