'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types/task';
import { Trash2, Edit3 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onToggleComplete, onDelete, onEdit }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`border-l-4 ${task.completed ? 'opacity-70' : ''}`} style={{ borderLeftColor: getPriorityColor(task.priority) }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <CardTitle className={`text-base ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <Badge variant={task.completed ? 'secondary' : 'default'}>
            {task.completed ? 'Completed' : 'Pending'}
          </Badge>
          <div className="flex space-x-2">
            <Badge variant="outline">{task.priority}</Badge>
            {task.tags && task.tags.length > 0 && (
              <div className="flex space-x-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {task.description && (
          <p className="mt-2 text-sm text-gray-600">{task.description}</p>
        )}
      </CardContent>
    </Card>
  );
}