import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Users, Search, Filter, MoreVertical, Shield, ShieldOff, Mail, Phone } from 'lucide-react'

export default async function StudentsPage() {
  const session = await auth()
  if (session?.user?.role !== 'INSTITUTE_ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const instituteId = session.user.instituteId
  
  const students = await prisma.user.findMany({
    where: { 
      instituteId,
      role: 'STUDENT'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { enrollments: true, testResults: true }
      }
    }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-space-grotesk font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Student Management
          </h2>
          <p className="text-outline">Manage and monitor all students enrolled in your institute.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full bg-surface-highest/50 border border-outline-variant/30 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <button className="p-2 rounded-xl bg-surface-highest border border-outline-variant/30 text-outline hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-outline">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-outline">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-outline">Engagement</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-outline">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        {student.name[0]}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{student.name}</div>
                        <div className="text-xs text-outline">Joined {new Date(student.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-outline">
                        <Mail className="w-3 h-3" /> {student.email}
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-2 text-xs text-outline">
                          <Phone className="w-3 h-3" /> {student.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-sm">{student._count.enrollments}</div>
                        <div className="text-[10px] text-outline uppercase">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-sm">{student._count.testResults}</div>
                        <div className="text-[10px] text-outline uppercase">Tests</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        title={student.isActive ? "Deactivate" : "Activate"}
                        className={`p-2 rounded-lg border border-outline-variant/20 transition-all ${student.isActive ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                      >
                        {student.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-highest transition-all">
                        <MoreVertical className="w-4 h-4 text-outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-outline">
                    No students found in this institute.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
