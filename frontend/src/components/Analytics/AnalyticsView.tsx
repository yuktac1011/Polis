import { useStore } from '../../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export const AnalyticsView = () => {
  const { issues } = useStore();

  // Process data for charts
  const categoryData = [
    { name: 'Infra', value: issues.filter(i => i.category === 'INFRASTRUCTURE').length },
    { name: 'Sanitation', value: issues.filter(i => i.category === 'SANITATION').length },
    { name: 'Safety', value: issues.filter(i => i.category === 'SAFETY').length },
    { name: 'Greenery', value: issues.filter(i => i.category === 'GREENERY').length },
  ];

  const statusData = [
    { name: 'Pending', value: issues.filter(i => i.status === 'New').length, color: '#323232' },
    { name: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, color: '#D97706' },
    { name: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length, color: '#059669' },
  ];

  // Mock timeline data
  const timelineData = [
    { date: 'Apr 20', issues: 12, resolved: 8 },
    { date: 'Apr 21', issues: 18, resolved: 10 },
    { date: 'Apr 22', issues: 15, resolved: 14 },
    { date: 'Apr 23', issues: 25, resolved: 18 },
    { date: 'Apr 24', issues: 32, resolved: 22 },
    { date: 'Apr 25', issues: issues.length, resolved: issues.filter(i => i.status === 'Resolved').length },
  ];

  return (
    <div className="p-xl max-w-container-max mx-auto w-full flex flex-col gap-xxl pb-xxl animate-in fade-in duration-700">
      <div className="flex flex-col gap-sm">
        <h1 className="font-h1 text-[32px] text-on-background">System Analytics</h1>
        <p className="font-body-lg text-apple-secondary max-w-2xl">
          Deep-dive telemetry into civic infrastructure health and administrative performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Chart 1: Issue Distribution by Category */}
        <div className="bg-white border border-apple-border rounded-3xl p-xl shadow-sm">
          <h3 className="text-sm font-bold text-apple-secondary uppercase tracking-widest mb-xl">Sector Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6E6E73', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6E6E73', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F2F2F7'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#323232" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown (Donut) */}
        <div className="bg-white border border-apple-border rounded-3xl p-xl shadow-sm">
          <h3 className="text-sm font-bold text-apple-secondary uppercase tracking-widest mb-xl">Operational Efficiency</h3>
          <div className="h-80 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-apple-text">{issues.length}</span>
              <span className="text-xs font-bold text-apple-secondary uppercase">Total Reports</span>
            </div>
          </div>
          <div className="flex justify-center gap-xl mt-4">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div>
                <span className="text-xs font-semibold text-apple-secondary">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Timeline Growth */}
        <div className="lg:col-span-2 bg-white border border-apple-border rounded-3xl p-xl shadow-sm">
          <h3 className="text-sm font-bold text-apple-secondary uppercase tracking-widest mb-xl">Resolution Velocity</h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#323232" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#323232" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6E6E73', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6E6E73', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="issues" stroke="#323232" strokeWidth={3} fillOpacity={1} fill="url(#colorIssues)" />
                <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
