import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'md',
  hover = false 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-200/50",
      paddingClasses[padding],
      shadowClasses[shadow],
      hover && "hover:shadow-lg hover:border-gray-300/50 transition-all duration-200",
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm text-gray-600 mt-1", className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-200/50", className)}>
      {children}
    </div>
  )
} 