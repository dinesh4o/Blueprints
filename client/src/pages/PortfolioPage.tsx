import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, MoreHorizontal, Activity, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, this would fetch from an endpoint that lists all reports
    // For now, we'll mock it or try to fetch a list if we had one.
    // Since we don't have a list endpoint, let's mock some data for the hackathon demo.
    const mockReports = [
      { id: '1', molecule: 'Metformin', viability: 8.5, status: 'Completed', date: '2023-10-27', indications: ['Cancer', 'Aging'] },
      { id: '2', molecule: 'Aspirin', viability: 6.2, status: 'Completed', date: '2023-10-26', indications: ['Inflammation'] },
      { id: '3', molecule: 'Rapamycin', viability: 9.1, status: 'Completed', date: '2023-10-25', indications: ['Longevity', 'Autoimmune'] },
      { id: '4', molecule: 'Atorvastatin', viability: 4.5, status: 'Failed', date: '2023-10-24', indications: ['Cardiovascular'] },
      { id: '5', molecule: 'Sildenafil', viability: 7.8, status: 'Completed', date: '2023-10-23', indications: ['Pulmonary Hypertension'] },
    ];
    
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 500);
  }, []);

  const filteredReports = reports.filter(r => r.molecule.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />

      <header className="bg-background/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/search')} className="text-muted-foreground hover:text-foreground rounded-full">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Research Portfolio</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex border-border/50 rounded-full bg-background/50 backdrop-blur-md">
              <Download size={14} className="mr-2" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => navigate('/search')} className="rounded-full">
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search molecules or indications..." 
              className="pl-9 bg-card/50 border-border/50 focus-visible:ring-primary/20 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-border/50 bg-card/50 rounded-full">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
        </div>

        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Molecule</th>
                  <th className="px-6 py-4 font-medium">Viability Score</th>
                  <th className="px-6 py-4 font-medium">Top Indications</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Loading portfolio...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No analyses found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report, i) => (
                    <motion.tr 
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Activity size={14} />
                          </div>
                          {report.molecule}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(report.viability / 10) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono">{report.viability.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {report.indications.map((ind: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50">
                              {ind}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={report.status === 'Completed' ? 'default' : 'destructive'} className="bg-opacity-10">
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {report.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <MoreHorizontal size={16} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
