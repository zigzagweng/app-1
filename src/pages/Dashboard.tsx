import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const { data: members } = trpc.user.list.useQuery();
  const { data: publications } = trpc.publication.list.useQuery();

  const memberPubCounts =
    members?.map((member) => ({
      ...member,
      count:
        publications?.filter((p) => p.userId === member.id).length ?? 0,
    })) ?? [];

  const totalPubs = publications?.length ?? 0;
  const totalMembers = members?.length ?? 0;

  // Calculate total IF
  const totalIF =
    publications?.reduce((sum, p) => {
      const ifVal = p.impactFactor ? parseFloat(String(p.impactFactor)) : 0;
      return sum + ifVal;
    }, 0) ?? 0;

  const avgIF = totalPubs > 0 ? (totalIF / totalPubs).toFixed(2) : "0";

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">仪表板</h1>
          <p className="text-slate-500 mt-1">
            课题组整体学术成果概览
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                成员总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                论文总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalPubs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                累计影响因子
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {totalIF.toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                平均影响因子
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{avgIF}</p>
            </CardContent>
          </Card>
        </div>

        {/* Members table */}
        <Card>
          <CardHeader>
            <CardTitle>成员成果统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">
                      姓名
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">
                      角色
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">
                      论文数
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">
                      累计 IF
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberPubCounts.map((member) => {
                    const memberPubs =
                      publications?.filter((p) => p.userId === member.id) ?? [];
                    const memberIF = memberPubs.reduce((sum, p) => {
                      const ifVal = p.impactFactor
                        ? parseFloat(String(p.impactFactor))
                        : 0;
                      return sum + ifVal;
                    }, 0);

                    return (
                      <tr
                        key={member.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name || ""}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                                {(member.displayName || member.name || "?").charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-slate-900">
                              {member.displayName || member.name || "未命名"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.role === "admin"
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {member.role === "admin" ? "组长" : "成员"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          {member.count}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          {memberIF.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/members/${member.id}`}
                            className="text-sm text-slate-600 hover:text-slate-900 underline"
                          >
                            查看详情
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {memberPubCounts.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400"
                      >
                        暂无成员数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}