
import { useQuery } from "@tanstack/react-query";
import { Badge } from "./ui/badge";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface TimelinePreviewProps {
  projectId: number;
}

export default function TimelinePreview({ projectId }: TimelinePreviewProps) {
  const { data: timeline, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "timeline"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/projects/${projectId}/timeline`);
      return await response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
        ))}
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No hay elementos en el timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timeline.map((item: any) => (
        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{item.title}</h4>
              <Badge 
                variant={
                  item.status === 'completed' ? 'default' :
                  item.status === 'in_progress' ? 'secondary' :
                  'outline'
                }
                className="text-xs"
              >
                {item.status === 'completed' ? 'Completado' :
                 item.status === 'in_progress' ? 'En Progreso' :
                 'Pendiente'}
              </Badge>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {item.estimatedDate && (
              <span>{new Date(item.estimatedDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
