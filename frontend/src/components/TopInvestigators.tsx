import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TopInvestigatorsProps {
  literatureData: any[];
}

export default function TopInvestigators({ literatureData }: TopInvestigatorsProps) {
  if (!literatureData || literatureData.length === 0) {
    return <div className="p-8 text-center text-muted-foreground w-full border rounded-lg">No key opinion leaders or authors found for this compound.</div>;
  }

  // Aggregate authors
  const authorCounts = new Map<string, { count: number; articles: any[] }>();

  literatureData.forEach((article) => {
    const authors = article.authors || [];
    authors.forEach((author: string) => {
      const existing = authorCounts.get(author) || { count: 0, articles: [] };
      existing.count += 1;
      existing.articles.push(article);
      authorCounts.set(author, existing);
    });
  });

  const sortedAuthors = Array.from(authorCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10); // Top 10

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="bg-muted/30 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users size={18} className="text-muted-foreground" />
          Key Opinion Leaders (Top Investigators)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/10 border-b border-border text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Investigator Name</th>
                <th className="px-6 py-4 font-medium">Publications</th>
                <th className="px-6 py-4 font-medium">Latest Relevant Title</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedAuthors.map(([name, data], i) => (
                <tr key={i} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                      {data.count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[300px]" title={data.articles[0]?.title}>
                    {data.articles[0]?.title || "Not determined"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
