import { useState } from "react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Trash2, Edit2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function Journals() {
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);

  const [formData, setFormData] = useState({
    journalName: "",
    issn: "",
    impactFactor: "",
    year: "",
  });

  const { data: journals } = trpc.journal.list.useQuery();
  const { data: searchResults } = trpc.journal.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 },
  );

  const upsertJournal = trpc.journal.upsert.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("期刊保存成功");
    },
    onError: (err) => {
      toast.error(err.message || "保存失败");
    },
  });

  const deleteJournal = trpc.journal.delete.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedJournal(null);
      toast.success("期刊删除成功");
    },
    onError: (err) => {
      toast.error(err.message || "删除失败");
    },
  });

  function resetForm() {
    setFormData({
      journalName: "",
      issn: "",
      impactFactor: "",
      year: "",
    });
  }

  function openAddDialog(journal?: any) {
    if (journal) {
      setFormData({
        journalName: journal.journalName,
        issn: journal.issn || "",
        impactFactor: journal.impactFactor ? String(journal.impactFactor) : "",
        year: journal.year || "",
      });
      setSelectedJournal(journal);
    } else {
      resetForm();
      setSelectedJournal(null);
    }
    setIsAddDialogOpen(true);
  }

  function openDeleteDialog(journal: any) {
    setSelectedJournal(journal);
    setIsDeleteDialogOpen(true);
  }

  function handleSubmit() {
    if (!formData.journalName) {
      toast.error("请输入期刊名称");
      return;
    }
    upsertJournal.mutate(formData);
  }

  function handleDelete() {
    if (!selectedJournal) return;
    deleteJournal.mutate({ id: selectedJournal.id });
  }

  const displayJournals = searchQuery.length >= 2 ? searchResults : journals;

  return (
    <MainLayout>
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">期刊管理</h1>
            <p className="text-slate-500 mt-1">
              维护期刊影响因子数据库，用于自动匹配论文影响因子
            </p>
          </div>
          <Button onClick={() => openAddDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            添加期刊
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="搜索期刊名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              期刊列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayJournals && displayJournals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        期刊名称
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        ISSN
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500">
                        影响因子
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">
                        年份
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayJournals.map((journal) => (
                      <tr
                        key={journal.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 text-slate-900 font-medium">
                          {journal.journalName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {journal.issn || "-"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {journal.impactFactor ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                              {journal.impactFactor}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {journal.year || "-"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openAddDialog(journal)}
                            >
                              <Edit2 className="w-4 h-4 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openDeleteDialog(journal)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无期刊数据</p>
                <p className="text-sm mt-1">点击上方按钮添加期刊</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedJournal ? "编辑期刊" : "添加期刊"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>期刊名称 *</Label>
              <Input
                value={formData.journalName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    journalName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>ISSN</Label>
              <Input
                value={formData.issn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, issn: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>影响因子</Label>
              <Input
                value={formData.impactFactor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    impactFactor: e.target.value,
                  }))
                }
                placeholder="例如: 15.3"
              />
            </div>
            <div className="space-y-2">
              <Label>年份</Label>
              <Input
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, year: e.target.value }))
                }
                placeholder="例如: 2024"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={upsertJournal.isPending}>
              {upsertJournal.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            确定要删除期刊「{selectedJournal?.journalName}」吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteJournal.isPending}
            >
              {deleteJournal.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
