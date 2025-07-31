'use client'

import { useState } from 'react'
import { Job } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface StatusBoardProps {
  jobs: Job[]
  onUpdate: (id: string, updates: Partial<Job>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  onConfirmDelete: (id: string, jobName: string) => void
}

const statusConfig = {
  applied: {
    label: 'Applied',
    color: 'bg-blue-50 border-blue-200/50',
    headerColor: 'bg-blue-600',
    countColor: 'bg-blue-100 text-blue-800'
  },
  interviewing: {
    label: 'Interviewing',
    color: 'bg-yellow-50 border-yellow-200/50',
    headerColor: 'bg-yellow-600',
    countColor: 'bg-yellow-100 text-yellow-800'
  },
  offer: {
    label: 'Offer',
    color: 'bg-green-50 border-green-200/50',
    headerColor: 'bg-green-600',
    countColor: 'bg-green-100 text-green-800'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 border-red-200/50',
    headerColor: 'bg-red-600',
    countColor: 'bg-red-100 text-red-800'
  }
}

// Sortable Job Card Component
function SortableJobCard({ job, onDelete, onConfirmDelete }: { 
  job: Job; 
  onDelete: (id: string) => Promise<void>
  onConfirmDelete: (id: string, jobName: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    const jobName = `${job.role} at ${job.company}`
    onConfirmDelete(job.id, jobName)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-xl border border-gray-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">{job.company}</h4>
          <p className="text-sm text-gray-600 truncate mt-1">{job.role}</p>
        </div>
        <button
          onClick={handleDelete}
          className="ml-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(job.applied_date).toLocaleDateString()}
        </span>
        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View
          </a>
        )}
      </div>
      
      {job.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{job.notes}</p>
        </div>
      )}
    </div>
  )
}

// Job Card Overlay for Drag
function JobCardOverlay({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-5 shadow-lg transform rotate-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">{job.company}</h4>
          <p className="text-sm text-gray-600 truncate mt-1">{job.role}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(job.applied_date).toLocaleDateString()}
        </span>
      </div>
      
      {job.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{job.notes}</p>
        </div>
      )}
    </div>
  )
}

// Droppable Status Column Component
function DroppableStatusColumn({ 
  status, 
  config, 
  jobs, 
  onDelete,
  onConfirmDelete
}: { 
  status: string
  config: any
  jobs: Job[]
  onDelete: (id: string) => Promise<void>
  onConfirmDelete: (id: string, jobName: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div ref={setNodeRef} className="h-full">
      <Card
        className={cn(
          config.color,
          isOver && 'ring-4 ring-blue-500 ring-opacity-70 shadow-xl scale-[1.02]'
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-200",
            isOver && "bg-blue-50/50"
          )}
        >
          <div className={cn('px-4 py-3 text-white rounded-t-2xl', config.headerColor)}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{config.label}</h3>
              <span className={cn('px-3 py-1 rounded-full text-xs font-medium', config.countColor)}>
                {jobs.length}
              </span>
            </div>
          </div>
          
          <div className="p-4 space-y-4 min-h-[400px]">
            {jobs.length === 0 ? (
              <div className={cn(
                "text-center py-12 transition-all duration-200",
                isOver && "bg-blue-100/50 rounded-xl border-2 border-dashed border-blue-300"
              )}>
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No applications</p>
                <p className={cn(
                  "text-xs mt-1 transition-colors duration-200",
                  isOver ? "text-blue-600 font-medium" : "text-gray-400"
                )}>
                  {isOver ? "Drop here!" : "Drop jobs here"}
                </p>
              </div>
            ) : (
              <SortableContext
                items={jobs.map(job => job.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <SortableJobCard
                      key={`${job.id}-${index}`}
                      job={job}
                      onDelete={onDelete}
                      onConfirmDelete={onConfirmDelete}
                    />
                  ))}
                  {isOver && (
                    <div className="h-2 bg-blue-200 rounded-lg border-2 border-dashed border-blue-400 animate-pulse"></div>
                  )}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function StatusBoard({ jobs, onUpdate, onDelete, onError, onSuccess, onConfirmDelete }: StatusBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id)
    setActiveJob(job || null)
    console.log('Drag started:', { jobId: event.active.id, job: job?.company })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)

    console.log('Drag end event:', { active: active.id, over: over?.id })
    
    // If no drop target, just return silently
    if (!over) {
      console.log('No drop target found - dropping outside board')
      return
    }

    const activeJob = jobs.find(j => j.id === active.id)
    const overStatus = over.id as Job['status']

    console.log('Drag details:', {
      activeJob: activeJob ? { id: activeJob.id, company: activeJob.company, status: activeJob.status } : null,
      overStatus,
      overId: over.id,
      validStatuses: Object.keys(statusConfig),
      isValidStatus: Object.keys(statusConfig).includes(overStatus)
    })

    // Check if the drop target is a valid status column
    if (!Object.keys(statusConfig).includes(overStatus)) {
      console.log('Invalid drop target - not a status column:', overStatus)
      return
    }

    if (activeJob && activeJob.status !== overStatus) {
      try {
        console.log(`Moving job ${activeJob.company} from ${activeJob.status} to ${overStatus}`)
        await onUpdate(activeJob.id, { status: overStatus })
        console.log('Job status updated successfully')
        onSuccess?.(`Moved ${activeJob.company} to ${overStatus}`)
      } catch (error) {
        console.error('Failed to update job status:', error)
        
        let errorMessage = 'Unknown error'
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        } else if (error && typeof error === 'object') {
          errorMessage = JSON.stringify(error)
        }
        
        onError?.(`Failed to update job status: ${errorMessage}`)
      }
    } else {
      console.log('No status change needed or invalid drop target')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusJobs = jobs.filter(job => job.status === status)
          
          return (
            <DroppableStatusColumn
              key={status}
              status={status}
              config={config}
              jobs={statusJobs}
              onDelete={onDelete}
              onConfirmDelete={onConfirmDelete}
            />
          )
        })}
      </div>
      <DragOverlay>
        {activeJob ? <JobCardOverlay job={activeJob} /> : null}
      </DragOverlay>
    </DndContext>
  )
} 