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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Loader2,
  FileText,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function Publications() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState<any>(null);

  // PMID fetch state
  const [pmidInput, setPmidInput] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userId: user?.id ?? 0,
    pmid: "",
    title: "",
    authors: "",
    journal: "",
    year: "",
    volume: "",
    issue: "",
    pages: "",
    doi: "",
    nlmCitation: "",
    impactFactor: "",
  });

  const { data: allPubs } = trpc.publication.list.useQuery();
  const { data: members } = trpc.user.list.useQuery();

  const fetchPubMed = trpc.publication.fetchFromPubMed.useMutation({
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        pmid: data.pmid,
        title: data.title,
        authors: data.authors,
        journal: data.journal,
        year: data.year,
        volume: data.volume || "",
        issue: data.issue || "",
        pages: data.pages || "",
        doi: data.doi || "",
        nlmCitation: data.nlmCitation,
        impactFactor: data.impactFactor || "",
      }));
      setIsFetching(false);
      toast.success("PubMed 检索成功");
    },
    onError: (err) => {
      setIsFetching(false);
      toast.error(err.message || "检索失败");
    },
  });

  const createPub = trpc.publication.create.useMutation({
    onSuccess: () => {
      utils.publication.list.invalidate();
      utils.publication.listByUser.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("论文添加成功");
    },
    onError: (err) => {
      toast.error(err.message || "添加失败");
    },
  });

  const updatePub = trpc.publication.update.useMutation({
    onSuccess: () => {
      utils.publication.list.invalidate();
      utils.publication.listByUser.invalidate();
      setIsEditDialogOpen(false);
      setSelectedPub(null);
      toast.success("论文更新成功");
    },
    onError: (err) => {
      toast.error(err.message || "更新失败");
    },
  });

  const deletePub = trpc.publication.delete.useMutation({
    onSuccess: () => {
      utils.publication.list.invalidate();
      utils.publication.listByUser.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedPub(null);
      toast.success("论文删除成功");
    },
    onError: (err) => {
      toast.error(err.message || "删除失败");
    },
  });

  function resetForm() {
    setPmidInput("");
    setFormData({
      userId: user?.id ?? 0,
      pmid: "",
      title: "",
      authors: "",
      journal: "",
      year: "",
      volume: "",
      issue: "",
      pages: "",
      doi: "",
      nlmCitation: "",
      impactFactor: "",
    });
  }

  function openAddDialog() {
    resetForm();
    setFormData((prev) => ({ ...prev, userId: user?.id ?? 0 }));
    setIsAddDialogOpen(true);
  }

  function openEditDialog(pub: any) {
    setSelectedPub(pub);
    setFormData({
      userId: pub.userId,
      pmid: pub.pmid,
      title: pub.title,
      authors: pub.authors,
      journal: pub.journal,
      year: pub.year,
      volume: pub.volume || "",
      issue: pub.issue || "",
      pages: pub.pages || "",
      doi: pub.doi || "",
      nlmCitation: pub.nlmCitation,
      impactFactor: pub.impactFactor ? String(pub.impactFactor) : "",
    });
    setIsEditDialogOpen(true);
  }

  function openDeleteDialog(pub: any) {
    setSelectedPub(pub);
    setIsDeleteDialogOpen(true);
  }

  function handleFetchPubMed() {
    if (!pmidInput.trim()) {
      toast.error("请输入 PMID");
      return;
    }
    setIsFetching(true);
    fetchPubMed.mutate({ pmid: pmidInput.trim() });
  }

  function handleSubmit() {
    if (!formData.title || !formData.authors || !formData.journal || !formData.year) {
      toast.error("请填写完整的论文信息");
      return;
    }
    createPub.mutate(formData);
  }

  function handleUpdate() {
    if (!selectedPub) return;
    updatePub.mutate({ ...formData, id: selectedPub.id });
  }

  function handleDelete() {
    if (!selectedPub) return;
    deletePub.mutate({ id: selectedPub.id });
  }

  // Filter pubs based on role
  const visiblePubs = isAdmin
    ? allPubs
    : allPubs?.filter((p) => p.userId === user?.id);

  const canEditPub = (pub: any) => isAdmin || pub.userId === user?.id;
  const canDeletePub = (pub: any) => isAdmin || pub.userId === user?.id;

  return (
    <MainLayout>
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">成果管理</h1>
            <p className="text-slate-500 mt-1">
              {isAdmin ? "管理所有成员的论文成果" : "管理我的论文成果"}
            </p>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            添加论文
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              论文列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visiblePubs && visiblePubs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-3 font-medium text-slate-500">PMID</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">题目</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">杂志</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">年份</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">所属成员</th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500">IF</th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePubs.map((pub) => {
                      const member = members?.find((m) => m.id === pub.userId);
                      return (
                        <tr
                          key={pub.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-3">
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 underline"
                            >
                              <Hash className="w-3 h-3" />
                              {pub.pmid}
                            </a>
                          </td>
                          <td className="py-3 px-3 text-slate-900 max-w-xs truncate" title={pub.title}>
                            {pub.title}
                          </td>
                          <td className="py-3 px-3 text-slate-700">{pub.journal}</td>
                          <td className="py-3 px-3 text-slate-700">{pub.year}</td>
                          <td className="py-3 px-3 text-slate-700">
                            {member?.displayName || member?.name || "未知"}
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
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canEditPub(pub) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditDialog(pub)}
                                >
                                  <Edit2 className="w-4 h-4 text-slate-500" />
                                </Button>
                              )}
                              {canDeletePub(pub) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openDeleteDialog(pub)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无论文数据</p>
                <p className="text-sm mt-1">点击上方按钮添加论文</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加论文</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* PMID Fetch */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <Label className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                通过 PMID 从 PubMed 自动检索
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入 PMID 号 (例如: 38012345)"
                  value={pmidInput}
                  onChange={(e) => setPmidInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchPubMed()}
                />
                <Button
                  onClick={handleFetchPubMed}
                  disabled={isFetching}
                  variant="secondary"
                >
                  {isFetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  检索
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                输入 PubMed ID 后点击检索，系统将自动从 PubMed 获取论文信息
              </p>
            </div>

            {/* Member selection (admin only) */}
            {isAdmin && members && (
              <div className="space-y-2">
                <Label>所属成员</Label>
                <Select
                  value={String(formData.userId)}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, userId: parseInt(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择成员" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.displayName || m.name || "未命名"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PMID</Label>
                <Input
                  value={formData.pmid}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pmid: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>发表年份</Label>
                <Input
                  value={formData.year}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, year: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>文章题目</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>作者</Label>
              <Input
                value={formData.authors}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, authors: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>杂志</Label>
              <Input
                value={formData.journal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, journal: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>卷号</Label>
                <Input
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, volume: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>期号</Label>
                <Input
                  value={formData.issue}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, issue: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>页码</Label>
                <Input
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pages: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DOI</Label>
                <Input
                  value={formData.doi}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, doi: e.target.value }))
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
                  placeholder="自动或手动填写"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>NLM 引用格式</Label>
              <textarea
                className="w-full min-h-[80px] p-3 text-sm border rounded-md bg-slate-50 text-slate-700 resize-y"
                value={formData.nlmCitation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nlmCitation: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={createPub.isPending}>
              {createPub.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑论文</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isAdmin && members && (
              <div className="space-y-2">
                <Label>所属成员</Label>
                <Select
                  value={String(formData.userId)}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, userId: parseInt(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择成员" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.displayName || m.name || "未命名"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PMID</Label>
                <Input
                  value={formData.pmid}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pmid: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>发表年份</Label>
                <Input
                  value={formData.year}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, year: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>文章题目</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>作者</Label>
              <Input
                value={formData.authors}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, authors: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>杂志</Label>
              <Input
                value={formData.journal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, journal: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>卷号</Label>
                <Input
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, volume: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>期号</Label>
                <Input
                  value={formData.issue}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, issue: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>页码</Label>
                <Input
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pages: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DOI</Label>
                <Input
                  value={formData.doi}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, doi: e.target.value }))
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>NLM 引用格式</Label>
              <textarea
                className="w-full min-h-[80px] p-3 text-sm border rounded-md bg-slate-50 text-slate-700 resize-y"
                value={formData.nlmCitation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nlmCitation: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={updatePub.isPending}>
              {updatePub.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
            确定要删除论文「{selectedPub?.title?.slice(0, 50)}
            {selectedPub?.title?.length > 50 ? "..." : ""}」吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePub.isPending}
            >
              {deletePub.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
