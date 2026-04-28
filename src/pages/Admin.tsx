import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function Admin() {
  const utils = trpc.useUtils();
  const { data: members } = trpc.user.list.useQuery();

  const updateRole = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      toast.success("角色更新成功");
    },
    onError: (err) => {
      toast.error(err.message || "更新失败");
    },
  });

  return (
    <MainLayout>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">系统管理</h1>
          <p className="text-slate-500 mt-1">管理用户角色和系统设置</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              用户角色管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">
                      用户
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">
                      UnionID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">
                      当前角色
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">
                      修改角色
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map((member) => (
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
                      <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                        {member.unionId}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.role === "admin"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {member.role === "admin" ? "组长" : "成员"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={member.role}
                          onValueChange={(role) =>
                            updateRole.mutate({
                              userId: member.id,
                              role: role as "user" | "admin",
                            })
                          }
                          disabled={updateRole.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">成员</SelectItem>
                            <SelectItem value="admin">组长</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {(!members || members.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400"
                      >
                        暂无用户数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>说明：</strong>
            组长(admin)可以管理所有成员的论文，成员(user)只能管理自己的论文。
            应用创建者自动被分配为组长角色。
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
