import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";
import { FileText, ArrowRight } from "lucide-react";

export default function Members() {
  const { data: members } = trpc.user.list.useQuery();
  const { data: publications } = trpc.publication.list.useQuery();

  const memberStats =
    members?.map((member) => {
      const memberPubs =
        publications?.filter((p) => p.userId === member.id) ?? [];
      const totalIF = memberPubs.reduce((sum, p) => {
        const ifVal = p.impactFactor ? parseFloat(String(p.impactFactor)) : 0;
        return sum + ifVal;
      }, 0);
      return {
        ...member,
        pubCount: memberPubs.length,
        totalIF: totalIF.toFixed(1),
      };
    }) ?? [];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">课题组成员</h1>
          <p className="text-slate-500 mt-1">查看所有成员及其学术成果</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberStats.map((member) => (
            <Link key={member.id} to={`/members/${member.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name || ""}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-medium text-slate-600">
                        {(member.displayName || member.name || "?").charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {member.displayName || member.name || "未命名"}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            member.role === "admin"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {member.role === "admin" ? "组长" : "成员"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {member.pubCount} 篇论文
                        </span>
                        <span>累计 IF: {member.totalIF}</span>
                      </div>
                      <div className="mt-3 flex items-center text-sm text-slate-600">
                        <span>查看成果</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {memberStats.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            暂无成员数据
          </div>
        )}
      </div>
    </MainLayout>
  );
}
