import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, Link } from "react-router";
import { FileText, ArrowLeft, ExternalLink, BookOpen, Hash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MemberProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const id = parseInt(userId || "0");

  const { data: member } = trpc.user.getById.useQuery(
    { id },
    { enabled: id > 0 },
  );
  const { data: publications } = trpc.publication.listByUser.useQuery(
    { userId: id },
    { enabled: id > 0 },
  );

  const isAdmin = user?.role === "admin";
  const isSelf = user?.id === id;
  const canEdit = isAdmin || isSelf;

  const totalIF =
    publications?.reduce((sum, p) => {
      const ifVal = p.impactFactor ? parseFloat(String(p.impactFactor)) : 0;
      return sum + ifVal;
    }, 0) ?? 0;

  if (!member) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto text-center py-16 text-slate-400">
          成员不存在
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to="/members"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回成员列表
          </Link>
          <div className="flex items-center gap-4">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name || ""}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-medium text-slate-600">
                {(member.displayName || member.name || "?").charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {member.displayName || member.name || "未命名"}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    member.role === "admin"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {member.role === "admin" ? "组长" : "成员"}
                </span>
                <span>{publications?.length ?? 0} 篇论文</span>
                <span>累计 IF: {totalIF.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              发表论文
            </CardTitle>
            {canEdit && (
              <Link
                to="/publications"
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                管理论文
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {publications && publications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-3 font-medium text-slate-500 w-12">
                        序号
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        作者
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        文章题目
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        杂志
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        年份
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        期卷号
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        页码
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        DOI
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        PMID
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500">
                        影响因子
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map((pub, index) => (
                      <tr
                        key={pub.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={pub.authors}>
                          {pub.authors}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-medium max-w-xs truncate" title={pub.title}>
                          {pub.title}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{pub.journal}</td>
                        <td className="py-3 px-3 text-slate-700">{pub.year}</td>
                        <td className="py-3 px-3 text-slate-700">
                          {pub.volume}
                          {pub.issue ? `(${pub.issue})` : ""}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{pub.pages}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {pub.doi ? (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-slate-900 underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{pub.doi}</span>
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-slate-900 underline"
                          >
                            <Hash className="w-3 h-3" />
                            {pub.pmid}
                          </a>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {pub.impactFactor ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                              {pub.impactFactor}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* NLM Citation Format */}
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    NLM 引用格式
                  </h3>
                  <div className="space-y-3">
                    {publications.map((pub, index) => (
                      <div
                        key={pub.id}
                        className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed"
                      >
                        <span className="text-slate-400 mr-2">[{index + 1}]</span>
                        {pub.nlmCitation}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无发表论文</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
