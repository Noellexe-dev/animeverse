import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AdminComment, AdminPost, AdminReport, AdminStats, AdminUser } from '../types'

export function useAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [reports, setReports] = useState<AdminReport[]>([])
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [comments, setComments] = useState<AdminComment[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [usersRes, reportsRes, postsRes, commentsRes, statsRes] = await Promise.all([
      supabase.rpc('admin_list_users'),
      supabase.rpc('admin_list_reports'),
      supabase.rpc('admin_list_posts'),
      supabase.rpc('admin_list_comments'),
      supabase.rpc('admin_stats'),
    ])
    setUsers((usersRes.data ?? []) as AdminUser[])
    setReports((reportsRes.data ?? []) as AdminReport[])
    setPosts((postsRes.data ?? []) as AdminPost[])
    setComments((commentsRes.data ?? []) as AdminComment[])
    setStats(((statsRes.data ?? []) as AdminStats[])[0] ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const run = useCallback(async (fn: () => PromiseLike<{ error: { message: string } | null }>, okMessage: string) => {
    setNotice(null)
    const { error } = await fn()
    setNotice(error ? `Error: ${error.message}` : okMessage)
    await load()
  }, [load])

  const setVerified = (id: string, value: boolean) =>
    run(() => supabase!.rpc('admin_set_verified', { target: id, value }), value ? 'Cuenta verificada.' : 'Verificación retirada.')

  const setBanned = (id: string, value: boolean) =>
    run(() => supabase!.rpc('admin_set_banned', { target: id, value }), value ? 'Cuenta bloqueada.' : 'Cuenta desbloqueada.')

  const setRole = (id: string, role: 'user' | 'mod' | 'admin') =>
    run(() => supabase!.rpc('admin_set_role', { target: id, new_role: role }), 'Rol actualizado.')

  const deleteUser = (id: string) =>
    run(() => supabase!.rpc('admin_delete_user', { target: id }), 'Cuenta eliminada.')

  const deletePost = (id: string) =>
    run(() => supabase!.rpc('admin_delete_post', { target: id }), 'Publicación eliminada.')

  const deleteComment = (id: string) =>
    run(() => supabase!.rpc('admin_delete_comment', { target: id }), 'Comentario eliminado.')

  const replyReport = (id: string, reply: string) =>
    run(() => supabase!.rpc('admin_reply_report', { target: id, reply }), 'Respuesta enviada.')

  const closeReport = (id: string) =>
    run(() => supabase!.rpc('admin_close_report', { target: id }), 'Reporte cerrado.')

  return {
    users, reports, posts, comments, stats, loading, notice,
    setVerified, setBanned, setRole, deleteUser,
    deletePost, deleteComment, replyReport, closeReport, reload: load,
  }
}
