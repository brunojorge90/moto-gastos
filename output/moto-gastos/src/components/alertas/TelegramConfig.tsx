import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  useTelegramConfig,
  useUpdateTelegramConfig,
  useTestarTelegram,
  useNotificarAgora,
} from '@/hooks/useAlertas'

export function TelegramConfig() {
  const { data, isLoading } = useTelegramConfig()
  const update = useUpdateTelegramConfig()
  const test = useTestarTelegram()
  const notificar = useNotificarAgora()

  const [chatId, setChatId] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  useEffect(() => {
    if (data?.chat_id !== undefined) setChatId(data.chat_id ?? '')
  }, [data?.chat_id])

  const handleSalvar = async () => {
    setFeedback(null)
    try {
      await update.mutateAsync(chatId.trim() || null)
      setFeedback({ type: 'ok', msg: 'Chat ID salvo.' })
    } catch {
      setFeedback({ type: 'err', msg: 'Falha ao salvar.' })
    }
  }

  const handleTestar = async () => {
    setFeedback(null)
    try {
      await test.mutateAsync()
      setFeedback({ type: 'ok', msg: 'Mensagem de teste enviada — confira o Telegram.' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setFeedback({ type: 'err', msg: e?.response?.data?.error ?? e?.message ?? 'Falha no envio.' })
    }
  }

  const handleNotificarAgora = async () => {
    setFeedback(null)
    try {
      const r = await notificar.mutateAsync()
      setFeedback({
        type: 'ok',
        msg: `Job executado: ${r.enviadas} enviadas • ${r.erros} erros • ${r.totalUsuarios} usuários.`,
      })
    } catch {
      setFeedback({ type: 'err', msg: 'Falha ao executar o job.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações no Telegram</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Quando uma manutenção estiver dentro da antecedência configurada (ex.: trocar a cada 2000 km, avisar
          aos 1800 km), o sistema envia uma mensagem no Telegram. Para receber, abra a conversa com o bot,
          envie <code>/start</code>, e cole abaixo seu <strong>chat_id</strong> (você obtém pelo bot{' '}
          <code>@userinfobot</code>).
        </p>

        <div className="space-y-2">
          <Label htmlFor="chat_id">Chat ID</Label>
          <Input
            id="chat_id"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="ex: 123456789"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSalvar} disabled={update.isPending}>
            {update.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleTestar}
            disabled={test.isPending || !chatId.trim()}
          >
            {test.isPending ? 'Enviando...' : 'Enviar teste'}
          </Button>
          <Button
            variant="outline"
            onClick={handleNotificarAgora}
            disabled={notificar.isPending}
          >
            {notificar.isPending ? 'Verificando...' : 'Verificar alertas agora'}
          </Button>
        </div>

        {feedback && (
          <p className={feedback.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
            {feedback.msg}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
