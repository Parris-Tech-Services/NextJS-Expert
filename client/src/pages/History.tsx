import { useHistory } from "@/hooks/use-history";
import { format } from "date-fns";
import { Clock } from "lucide-react";

export default function History() {
  const { data: history, isLoading } = useHistory();

  // Group by month just for fun visual separation? 
  // Let's keep it simple first as requested: Simple list.

  return (
    <div className="min-h-screen bg-background pb-24 pt-16 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          Past Eats
        </h1>

        <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pl-8 py-2">
          {isLoading ? (
             <div className="text-muted-foreground text-sm">Loading history...</div>
          ) : history?.length === 0 ? (
             <div className="text-muted-foreground text-sm">No history yet. Go eat something!</div>
          ) : (
            history?.map((item) => (
              <div key={item.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-4 border-background shadow-sm" />
                
                <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-lg">{item.nameSnapshot}</p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    {format(new Date(item.date), "EEEE, MMM do")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
