import { MCPServerType } from '@/types/mcp';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, Loader2, Wand2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HttpBusinessCode } from '@/constants/http';
import { toast } from 'sonner';

interface MCPServer {
  id?: string;
  name: string;
  type: MCPServerType;
  enabled: boolean;
  command?: string;
  args?: unknown[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

interface MCPServerFormProps {
  isOpen: boolean; // 是否显示表单
  onClose: () => void; // 关闭表单
  onSaved: () => void; // 保存表单数据
  server?: MCPServer; // 当前编辑的服务器数据
}

export default function MCPServerForm({ isOpen, onClose, onSaved, server }: MCPServerFormProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to generate JSON for server
  const generateServerJson = useCallback((serverData?: MCPServer) => {
    if (serverData) {
      const serverConfig: Record<string, unknown> = {
        transport: serverData.type,
      };

      if (serverData.type === 'stdio') {
        serverConfig.command = serverData.command;
        if (serverData.args) serverConfig.args = serverData.args;
        if (serverData.env) serverConfig.env = serverData.env;
      } else {
        serverConfig.url = serverData.url;
        if (serverData.headers) serverConfig.headers = serverData.headers;
      }

      return JSON.stringify(
        {
          mcpServers: {
            [serverData.name]: serverConfig,
          },
        },
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        mcpServers: {
          example_server: {
            transport: 'stdio',
            command: 'python',
            args: ['server.py'],
            env: { API_KEY: 'your_key' },
          },
          remote_server: {
            transport: 'http',
            url: 'http://localhost:8000/mcp/',
            headers: { Authorization: 'Bearer token' },
          },
        },
      },
      null,
      2,
    );
  }, []);

  // JSON 格式验证函数，检查是否包含 mcpServers 对象
  const validateJson = useCallback((jsonString: string) => {
    if (!jsonString.trim()) {
      setValidationError(null);
      setIsValidJson(true);
      return true;
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
        setValidationError('Invalid format: missing mcpServers object');
        setIsValidJson(false);
        return false;
      }
      setValidationError(null);
      setIsValidJson(true);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid JSON';
      setValidationError(`JSON Syntax Error: ${errorMsg}`);
      setIsValidJson(false);
      return false;
    }
  }, []);

  // 当编辑的服务器数据变化时，更新 JSON 输入框
  useEffect(() => {
    const newJson = generateServerJson(server);
    setJsonInput(newJson);
    validateJson(newJson);
  }, [server, generateServerJson, validateJson]);

  // 格式化 JSON 字符串，确保缩进和换行符正确
  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      validateJson(formatted);
    } catch {
      // 如果解析失败，显示错误信息
      validateJson(jsonInput);
    }
  }, [jsonInput, validateJson]);

  // 输入时实时验证 JSON 格式
  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonInput(value);
      // 防抖验证，避免频繁调用验证函数
      const timeoutId = setTimeout(() => validateJson(value), 300);
      return () => clearTimeout(timeoutId);
    },
    [validateJson],
  );

  // 处理粘贴事件，自动格式化 JSON 字符串
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pastedText = e.clipboardData.getData('text');
      try {
        const parsed = JSON.parse(pastedText);
        const formatted = JSON.stringify(parsed, null, 2);
        e.preventDefault();
        setJsonInput(formatted);
        validateJson(formatted);
      } catch {
        // If not valid JSON, let default paste behavior happen
      }
    },
    [validateJson],
  );

  // 处理保存事件，验证 JSON 格式并保存到服务器
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Final validation before saving
    if (!validateJson(jsonInput)) {
      setSaving(false);
      setError(validationError || '请在保存前修复 JSON 验证错误');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
        throw new Error('Invalid format: missing mcpServers object');
      }

      const serverEntries = Object.entries(parsed.mcpServers);

      for (const [name, config] of serverEntries) {
        const serverConfig = config as Record<string, unknown>;

        if (!serverConfig.transport || !['stdio', 'http'].includes(serverConfig.transport as string)) {
          throw new Error(`Invalid transport for ${name}: must be "stdio" or "http"`);
        }

        if (serverConfig.transport === 'stdio' && !serverConfig.command) {
          throw new Error(`Missing command for stdio server: ${name}`);
        }

        if (serverConfig.transport === 'http' && !serverConfig.url) {
          throw new Error(`Missing url for http server: ${name}`);
        }

        const serverData = {
          name,
          type: serverConfig.transport as MCPServerType,
          command: serverConfig.transport === 'stdio' ? serverConfig.command : undefined,
          args: serverConfig.transport === 'stdio' ? serverConfig.args : undefined,
          env: serverConfig.transport === 'stdio' ? serverConfig.env : undefined,
          url: serverConfig.transport === 'http' ? serverConfig.url : undefined,
          headers: serverConfig.transport === 'http' ? serverConfig.headers : undefined,
        };

        const method = server ? 'PATCH' : 'POST';
        const body = server ? { ...serverData, id: server.id } : serverData;

        const response = await fetch('/api/mcp-servers', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        let errorMessage = server ? 'MCP Server Edit Failed' : 'MCP Server Save Failed';

        if (!response.ok) {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.error || errorMessage;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.code === HttpBusinessCode.FAIL) {
          throw new Error(data.message || errorMessage);
        }
      }

      onSaved();
      toast.success('配置保存成功');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-card text-card-foreground shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            {/* 显示表单标题，根据是否有 MCP 数据来判断 */}
            {server ? '编辑 MCP 配置' : '添加 MCP 配置'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-transparent">
            <X size={20} />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">MCP Server Configuration (JSON)</label>
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={formatJson}
                  className="h-auto cursor-pointer gap-1.5 rounded-md px-2 py-1 text-xs"
                  title="Format JSON">
                  <Wand2 size={12} />
                  Format
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  onPaste={handlePaste}
                  className={cn(
                    'h-64 rounded-md p-3 font-mono text-sm focus-visible:ring-2 focus-visible:ring-ring/40',
                    validationError
                      ? 'border-destructive bg-destructive/5 focus-visible:border-destructive'
                      : isValidJson && jsonInput.trim()
                        ? 'border-emerald-500/50 bg-emerald-500/5 focus-visible:border-primary dark:border-emerald-400/50 dark:bg-emerald-400/5'
                        : 'focus-visible:border-primary',
                  )}
                  placeholder="Enter JSON configuration..."
                />
                {validationError && (
                  <div className="absolute top-2 right-2 rounded bg-destructive/10 px-2 py-1">
                    <span className="text-xs text-destructive">❌</span>
                  </div>
                )}
                {!validationError && isValidJson && jsonInput.trim() && (
                  <div className="absolute top-2 right-2 rounded bg-emerald-500/15 px-2 py-1 dark:bg-emerald-400/15">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">✅</span>
                  </div>
                )}
              </div>
              {/* 显示 JSON 格式验证错误 */}
              {validationError && <p className="mt-1 text-xs text-destructive">{validationError}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                配置本地（stdio）和远程（http）MCP服务器。粘贴JSON以自动格式化。
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 cursor-pointer px-4 text-sm font-medium">
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-9 cursor-pointer gap-2 px-4 text-sm font-medium">
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                保存中...
              </>
            ) : (
              <>
                <Check size={16} />
                保存配置
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
