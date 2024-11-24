import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, User } from "lucide-react";

interface TrackingResultProps {
  data: {
    code: string;
    status: string;
    timestamp: string;
    client: string;
  };
}

export default function TrackingResult({ data }: TrackingResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Информация о посылке
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <div className="font-semibold">Трек номер:</div>
            <div>{data.code}</div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <div className="font-semibold">Получатель:</div>
            <div>{data.client}</div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div className="font-semibold">Последнее обновление:</div>
            <div>{data.timestamp}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-semibold">Статус:</div>
            <div className="text-primary">{data.status}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}