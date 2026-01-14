import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, User as UserIcon, Mail, Calendar, Shield, Loader2, X, Trash2, KeyRound, Copy, RefreshCw, Link2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { uploadAvatar, deleteAvatar, getSignedAvatarUrl, getPublicAvatarUrl } from '../services/avatarService';
import { Skill, User as UserType } from '../types';
import AvatarCropper from '../components/AvatarCropper';
import { getStoredSkills } from '../services/skillsService';

interface SettingsPageProps {
  user: UserType | null;
}

type TabType = 'profile' | 'mcp';
type ToastKind = 'success' | 'error';

interface McpConnection {
  id: string;
  user_id: string;
  name: string;
  token_prefix: string;
  allowed_skill_ids: string[];
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [role, setRole] = useState<string>('User');
  const [profileAvatarPathOrUrl, setProfileAvatarPathOrUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: ToastKind; title: string; message?: string } | null>(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpConnection, setMcpConnection] = useState<McpConnection | null>(null);
  const [mcpGeneratedToken, setMcpGeneratedToken] = useState<string | null>(null);
  const [mcpEndpoint, setMcpEndpoint] = useState<string>('');
  const [mcpScriptPath, setMcpScriptPath] = useState<string>(() => {
    try {
      return window.localStorage.getItem('mcp_script_path') || './scripts/mcp/agentkit-mcp-stdio.js';
    } catch {
      return './scripts/mcp/agentkit-mcp-stdio.js';
    }
  });
  const [mcpSkills, setMcpSkills] = useState<Skill[]>([]);
  const [mcpAllowedSkillIds, setMcpAllowedSkillIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const showToast = (kind: ToastKind, title: string, message?: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ kind, title, message });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast('success', 'Copiado', 'Conteúdo copiado para a área de transferência.');
    } catch {
      showToast('error', 'Falha ao copiar', 'Não foi possível copiar para a área de transferência.');
    }
  };

  const sha256Hex = async (value: string) => {
    const enc = new TextEncoder();
    const data = enc.encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const randomToken = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const bin = String.fromCharCode(...Array.from(bytes));
    const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `akp_${b64}`;
  };

  useEffect(() => {
    setMcpEndpoint(window.location.origin);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('mcp_script_path', mcpScriptPath);
    } catch {
    }
  }, [mcpScriptPath]);

  const loadMcpData = async () => {
    if (!user?.id) return;
    setMcpLoading(true);
    try {
      const { data: conn, error: connError } = await supabase
        .from('mcp_connections')
        .select('*')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (connError && connError.code !== 'PGRST116') {
        throw connError;
      }

      const connection = (conn as McpConnection | null) || null;
      setMcpConnection(connection);

      const skills = await getStoredSkills(user.id);
      setMcpSkills(skills);

      const allowedIds = new Set<string>((connection?.allowed_skill_ids || []).filter(Boolean));
      setMcpAllowedSkillIds(allowedIds);
    } catch (e: any) {
      showToast('error', 'Falha ao carregar MCP', e?.message || 'Não foi possível carregar a configuração do MCP.');
    } finally {
      setMcpLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'mcp') return;
    loadMcpData();
  }, [activeTab, user?.id]);

  const persistAllowedSkills = async (next: Set<string>) => {
    if (!mcpConnection?.id) {
      setMcpAllowedSkillIds(next);
      return;
    }
    setMcpLoading(true);
    try {
      const allowed = Array.from(next);
      const { data, error } = await supabase
        .from('mcp_connections')
        .update({ allowed_skill_ids: allowed })
        .eq('id', mcpConnection.id)
        .select('*')
        .single();
      if (error) throw error;
      setMcpConnection(data as McpConnection);
      setMcpAllowedSkillIds(new Set<string>((data as McpConnection).allowed_skill_ids || []));
      showToast('success', 'MCP atualizado', 'Skills ativas do MCP foram salvas.');
    } catch (e: any) {
      showToast('error', 'Falha ao salvar MCP', e?.message || 'Não foi possível salvar as skills do MCP.');
    } finally {
      setMcpLoading(false);
    }
  };

  const handleToggleMcpSkill = (skillId: string) => {
    const next = new Set(mcpAllowedSkillIds);
    if (next.has(skillId)) next.delete(skillId);
    else next.add(skillId);
    setMcpAllowedSkillIds(next);
  };

  const handleSaveMcpSkills = async () => {
    await persistAllowedSkills(mcpAllowedSkillIds);
  };

  const handleCreateOrRotateMcpToken = async () => {
    if (!user?.id) return;
    setMcpLoading(true);
    try {
      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      const tokenPrefix = token.slice(0, 12);

      if (mcpConnection?.id) {
        await supabase
          .from('mcp_connections')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', mcpConnection.id);
      }

      const allowed = Array.from(mcpAllowedSkillIds);
      const { data, error } = await supabase
        .from('mcp_connections')
        .insert({
          user_id: user.id,
          name: 'default',
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          allowed_skill_ids: allowed,
        })
        .select('*')
        .single();

      if (error) throw error;
      setMcpConnection(data as McpConnection);
      setMcpGeneratedToken(token);
      showToast('success', 'Token gerado', 'Copie e guarde o token. Ele não será exibido novamente.');
    } catch (e: any) {
      showToast('error', 'Falha ao gerar token', e?.message || 'Não foi possível gerar o token do MCP.');
    } finally {
      setMcpLoading(false);
    }
  };

  const handleRevokeMcpToken = async () => {
    if (!mcpConnection?.id) return;
    setMcpLoading(true);
    try {
      const { error } = await supabase
        .from('mcp_connections')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', mcpConnection.id);
      if (error) throw error;
      setMcpConnection(null);
      setMcpGeneratedToken(null);
      showToast('success', 'Token revogado', 'A conexão MCP foi revogada.');
    } catch (e: any) {
      showToast('error', 'Falha ao revogar token', e?.message || 'Não foi possível revogar o token.');
    } finally {
      setMcpLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    };
  }, []);

  const normalizeAvatarValue = (value: string | null | undefined) => {
    if (!value) return null;
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;

    if (value.startsWith('http') && value.includes('/storage/v1/object/avatars/')) {
      const match = value.match(/\/storage\/v1\/object\/avatars\/([^?]+)/);
      const fileName = match?.[1] ? decodeURIComponent(match[1]) : null;
      return fileName || value;
    }

    if (value.startsWith('http') && value.includes('/storage/v1/object/sign/avatars/')) {
      const match = value.match(/\/storage\/v1\/object\/sign\/avatars\/([^?]+)/);
      const fileName = match?.[1] ? decodeURIComponent(match[1]) : null;
      return fileName || value;
    }

    return value;
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('email, display_name, avatar_url, role, created_at')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setDisplayName(data.display_name || user.display_name || '');
        setEmail(data.email || user.email || '');
        setCreatedAt(data.created_at || '');
        setRole(data.role || user.role || 'User');
        setProfileAvatarPathOrUrl(normalizeAvatarValue(data.avatar_url) || normalizeAvatarValue(user.avatar) || null);
      } else {
        setDisplayName(user.display_name || '');
        setEmail(user.email || '');
        setCreatedAt('');
        setRole(user.role || 'User');
        setProfileAvatarPathOrUrl(normalizeAvatarValue(user.avatar) || null);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    const resolveAvatar = async () => {
      if (!profileAvatarPathOrUrl) {
        setAvatarPreview(null);
        return;
      }

      if (profileAvatarPathOrUrl.startsWith('data:') || profileAvatarPathOrUrl.startsWith('blob:')) {
        setAvatarPreview(profileAvatarPathOrUrl);
        return;
      }

      if (profileAvatarPathOrUrl.startsWith('http')) {
        if (profileAvatarPathOrUrl.includes('/storage/v1/object/sign/avatars/')) {
          setAvatarPreview(profileAvatarPathOrUrl);
          return;
        }

        if (profileAvatarPathOrUrl.includes('/storage/v1/object/public/avatars/')) {
          setAvatarPreview(profileAvatarPathOrUrl);
          return;
        }

        if (profileAvatarPathOrUrl.includes('/storage/v1/object/') && profileAvatarPathOrUrl.includes('/avatars/')) {
          const match = profileAvatarPathOrUrl.match(/\/storage\/v1\/object\/(?:public\/)?avatars\/([^?]+)/);
          const fileName = match?.[1] ? decodeURIComponent(match[1]) : null;

          if (fileName) {
            const { url, error } = await getSignedAvatarUrl(fileName);
            if (url) {
              setAvatarPreview(url);
              return;
            }

            setAvatarPreview(null);
            showToast('error', 'Avatar indisponível', error || 'Não foi possível gerar o link assinado do avatar.');
            return;
          }
        }

        if (profileAvatarPathOrUrl.includes('/storage/v1/object/avatars/')) {
          setAvatarPreview(null);
          showToast('error', 'Avatar indisponível', 'URL do Storage inválida (faltando /public ou /sign).');
          return;
        }

        setAvatarPreview(profileAvatarPathOrUrl);
        return;
      }

      const { url, error } = await getSignedAvatarUrl(profileAvatarPathOrUrl);
      if (url) {
        setAvatarPreview(url);
      } else {
        setAvatarPreview(null);
        showToast('error', 'Avatar indisponível', error || 'Não foi possível carregar seu avatar.');
      }
    };

    resolveAvatar();
  }, [profileAvatarPathOrUrl]);

  useEffect(() => {
    avatarPreviewRef.current = avatarPreview;
  }, [avatarPreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Invalid file', 'Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File too large', 'File size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageForCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!user || !selectedImageForCrop) return;

    setIsUploading(true);
    try {
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = selectedImageForCrop;
      });

      // Create canvas with crop area dimensions
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw image to canvas
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert to blob using WebP format
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/webp');
      });

      if (!blob || blob.size === 0) {
        throw new Error('Failed to create blob or blob is empty');
      }

      const croppedFile = new File([blob], 'avatar.webp', { type: 'image/webp' });
      const { path, error } = await uploadAvatar(user.id, croppedFile);

      if (error) {
        if (error.toLowerCase().includes('bucket not found')) {
          showToast('error', 'Falha no upload do avatar', 'Bucket "avatars" não existe no Storage do Supabase.');
        } else {
          showToast('error', 'Falha no upload do avatar', error);
        }
        setIsUploading(false);
        return;
      }

      // Use public URL for display
      const { url: publicUrl } = getPublicAvatarUrl(path);
      const avatarUrlToStore = publicUrl || path;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrlToStore })
        .eq('id', user.id);

      if (updateError) {
        showToast('error', 'Falha ao salvar avatar', updateError.message);
        setIsUploading(false);
        return;
      }

      // Create blob URL for immediate preview
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
      previewObjectUrlRef.current = URL.createObjectURL(blob);

      // Update UI
      setShowCropper(false);
      setSelectedImageForCrop(null);
      setAvatarPreview(previewObjectUrlRef.current);
      setIsUploading(false);
      showToast('success', 'Avatar salvo', 'Seu avatar foi atualizado.');
    } catch (e: any) {
      showToast('error', 'Falha no upload do avatar', e?.message || 'Não foi possível enviar o avatar.');
      setIsUploading(false);
      setShowCropper(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImageForCrop(null);
  };

  const handleResetAvatar = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Delete from storage
      const currentAvatarPath = profileAvatarPathOrUrl;

      if (currentAvatarPath) {
        // Extract filename from URL or path
        let fileName = currentAvatarPath;
        if (currentAvatarPath.startsWith('http')) {
          const match = currentAvatarPath.match(/\/avatars\/([^?/]+)/);
          if (match?.[1]) {
            fileName = decodeURIComponent(match[1]);
          } else if (currentAvatarPath.includes('/storage/v1/object/public/avatars/')) {
            const publicMatch = currentAvatarPath.match(/\/public\/avatars\/(.+)$/);
            if (publicMatch?.[1]) {
              fileName = decodeURIComponent(publicMatch[1]);
            }
          }
        }

        // Try to delete from storage (might fail if file doesn't exist, but that's ok)
        if (fileName && fileName !== currentAvatarPath) {
          await deleteAvatar(fileName);
        }
      }

      // Clear from database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        showToast('error', 'Falha ao remover avatar', updateError.message);
        setIsDeleting(false);
        return;
      }

      setAvatarPreview(null);
      setProfileAvatarPathOrUrl(null);
      setIsDeleting(false);
      showToast('success', 'Avatar removido', 'Seu avatar foi removido com sucesso.');
    } catch (e: any) {
      // Even if storage deletion fails, we cleared the database
      showToast('success', 'Avatar removido', 'Seu avatar foi removido com sucesso.');
      setIsDeleting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) {
        showToast('error', 'Falha ao salvar', error.message);
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
      showToast('success', 'Perfil salvo', 'Alterações do perfil salvas com sucesso.');
    } catch (e: any) {
      showToast('error', 'Falha ao salvar', e?.message || 'Não foi possível salvar o perfil.');
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full h-full flex flex-col">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">SYSTEM CONFIGURATION</h2>
        <p className="text-gray-400">Manage your account settings and preferences.</p>
        <div className="h-px w-full bg-gradient-to-r from-cyber-border via-transparent to-transparent mt-4"></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`
            px-6 py-3 text-sm font-bold transition-colors relative
            ${activeTab === 'profile'
              ? 'text-cyber-blue border-b-2 border-cyber-blue bg-cyber-blue/5'
              : 'text-gray-500 hover:text-white'
            }
          `}
        >
          PROFILE
        </button>
        <button
          onClick={() => setActiveTab('mcp')}
          className={`
            px-6 py-3 text-sm font-bold transition-colors relative
            ${activeTab === 'mcp'
              ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-cyber-cyan/5'
              : 'text-gray-500 hover:text-white'
            }
          `}
        >
          MCP
        </button>
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 rounded-lg p-4 max-w-sm shadow-2xl backdrop-blur z-50 border animate-in slide-in-from-bottom-4 fade-in duration-300 ${
            toast.kind === 'success'
              ? 'bg-cyber-panel/90 border-cyber-green/40'
              : 'bg-cyber-panel/90 border-red-500/40'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  toast.kind === 'success'
                    ? 'bg-cyber-green/10 border-cyber-green/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <Shield size={16} className={toast.kind === 'success' ? 'text-cyber-green' : 'text-red-400'} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">{toast.title}</h4>
              {toast.message && <p className="text-xs text-gray-400">{toast.message}</p>}
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Avatar Cropper Modal */}
      {showCropper && selectedImageForCrop && (
        <AvatarCropper
          image={selectedImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onConfirm={() => {}}
        />
      )}

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Avatar Section */}
            <div className="bg-cyber-panel/50 border border-cyber-border rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <UserIcon size={20} className="mr-2" />
                Avatar Settings
              </h3>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-64 h-64 bg-cyber-dark rounded-full overflow-hidden border border-cyber-border mx-auto">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <UserIcon size={64} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {avatarPreview ? 'Avatar atual carregado' : 'Nenhum avatar definido'}
                    </span>
                    {avatarPreview && (
                      <button
                        onClick={handleResetAvatar}
                        disabled={isDeleting}
                        className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Trash2 size={14} />
                            <span>Remover</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading || showCropper}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || showCropper}
                      className="flex-1 bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-white py-3 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={18} className="mr-2" />
                      Selecionar Imagem
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-cyber-panel/50 border border-cyber-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Shield size={20} className="mr-2" />
                Profile Information
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 px-4 text-white text-sm focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Email Address</label>
                  <div className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 px-4 text-gray-400 text-sm flex items-center">
                    <Mail size={16} className="mr-3" />
                    {email}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Account Created</label>
                  <div className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 px-4 text-gray-400 text-sm flex items-center">
                    <Calendar size={16} className="mr-3" />
                    {createdAt ? formatDate(createdAt) : 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Role</label>
                  <div className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 px-4 text-cyber-orange text-sm flex items-center">
                    <Shield size={16} className="mr-3" />
                    {role || 'User'}
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-cyber-blue hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(45,96,255,0.39)]"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-cyber-panel/50 border border-cyber-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <KeyRound size={18} className="mr-2 text-cyber-cyan" />
                    MCP STDIO
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Exponha suas Skills selecionadas via Model Context Protocol (Tools) para IDEs/CLIs.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateOrRotateMcpToken}
                    disabled={mcpLoading}
                    className="bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <RefreshCw size={14} className={`mr-2 ${mcpLoading ? 'animate-spin' : ''}`} />
                    {mcpConnection ? 'ROTACIONAR TOKEN' : 'GERAR TOKEN'}
                  </button>
                  {mcpConnection && (
                    <button
                      onClick={handleRevokeMcpToken}
                      disabled={mcpLoading}
                      className="bg-cyber-dark border border-red-500/40 hover:bg-red-500/10 text-red-300 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      REVOGAR
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-cyber-dark/60 border border-cyber-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase text-gray-400">Conexão</p>
                    <button
                      onClick={() => copyToClipboard(mcpEndpoint)}
                      className="text-gray-400 hover:text-white transition-colors text-xs flex items-center"
                      type="button"
                    >
                      <Link2 size={14} className="mr-1" />
                      Copiar endpoint
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Endpoint</span>
                      <span className="text-xs text-white font-mono truncate max-w-[260px]">{mcpEndpoint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Token</span>
                      <span className="text-xs text-white font-mono">
                        {mcpGeneratedToken ? `${mcpGeneratedToken.slice(0, 8)}…` : mcpConnection ? `${mcpConnection.token_prefix}…` : 'não configurado'}
                      </span>
                    </div>
                    {mcpGeneratedToken && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-cyber-cyan font-mono">TOKEN GERADO (COPIE AGORA)</span>
                          <button
                            onClick={() => copyToClipboard(mcpGeneratedToken)}
                            className="text-cyber-cyan hover:text-white transition-colors text-xs flex items-center"
                            type="button"
                          >
                            <Copy size={14} className="mr-1" />
                            Copiar token
                          </button>
                        </div>
                        <div className="bg-cyber-black border border-cyber-border rounded-lg p-3 text-xs font-mono text-white break-all">
                          {mcpGeneratedToken}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-cyber-dark/60 border border-cyber-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase text-gray-400">Config MCP</p>
                    <div className="flex gap-3">
                      <button
                      onClick={() => {
                        const tokenPlaceholder = mcpGeneratedToken || '<SEU_TOKEN>';
                        const snippet = JSON.stringify(
                          {
                            mcpServers: {
                              'agentkit-pro': {
                                command: 'node',
                                args: [mcpScriptPath],
                                env: {
                                  AGENTKIT_MCP_ENDPOINT: mcpEndpoint,
                                  AGENTKIT_MCP_TOKEN: tokenPlaceholder,
                                },
                              },
                            },
                          },
                          null,
                          2
                        );
                        copyToClipboard(snippet);
                      }}
                      className="text-gray-400 hover:text-white transition-colors text-xs flex items-center"
                      type="button"
                    >
                      <Copy size={14} className="mr-1" />
                      Copiar config
                    </button>
                      <button
                        onClick={() => {
                          const tokenPlaceholder = mcpGeneratedToken || '<SEU_TOKEN>';
                          const snippet = JSON.stringify(
                            {
                              mcpServers: {
                                'agentkit-pro': {
                                  command: 'npx',
                                  args: ['-y', '--package', '@agentkit-pro/mcp', 'agentkit-pro-mcp'],
                                  env: {
                                    AGENTKIT_MCP_ENDPOINT: mcpEndpoint,
                                    AGENTKIT_MCP_TOKEN: tokenPlaceholder,
                                  },
                                },
                              },
                            },
                            null,
                            2
                          );
                          copyToClipboard(snippet);
                        }}
                        className="text-gray-400 hover:text-white transition-colors text-xs flex items-center"
                        type="button"
                      >
                        <Copy size={14} className="mr-1" />
                        Copiar config (npx)
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Script (args[0])</label>
                    <input
                      type="text"
                      value={mcpScriptPath}
                      onChange={(e) => setMcpScriptPath(e.target.value)}
                      className="w-full bg-cyber-black border border-cyber-border rounded-lg py-2 px-3 text-white text-xs font-mono focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all"
                      placeholder="D:\\...\\AgentKit-Pro\\scripts\\mcp\\agentkit-mcp-stdio.js"
                    />
                    <div className="mt-2 text-[10px] text-gray-400">
                      No TRAE, use caminho absoluto (args relativo pode falhar).
                    </div>
                  </div>
                  <div className="mt-2 bg-cyber-black border border-cyber-border rounded-lg p-3 text-xs font-mono text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(
                      {
                        mcpServers: {
                          'agentkit-pro': {
                            command: 'node',
                            args: [mcpScriptPath],
                            env: {
                              AGENTKIT_MCP_ENDPOINT: mcpEndpoint,
                              AGENTKIT_MCP_TOKEN: mcpGeneratedToken || '<SEU_TOKEN>',
                            },
                          },
                        },
                      },
                      null,
                      2
                    )}
                  </div>
                  <div className="mt-3 bg-cyber-black border border-cyber-border rounded-lg p-3 text-xs font-mono text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(
                      {
                        mcpServers: {
                          'agentkit-pro': {
                            command: 'npx',
                            args: ['-y', '--package', '@agentkit-pro/mcp', 'agentkit-pro-mcp'],
                            env: {
                              AGENTKIT_MCP_ENDPOINT: mcpEndpoint,
                              AGENTKIT_MCP_TOKEN: mcpGeneratedToken || '<SEU_TOKEN>',
                            },
                          },
                        },
                      },
                      null,
                      2
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-cyber-panel/50 border border-cyber-border rounded-xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Skills Ativas no MCP</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Somente as skills marcadas abaixo serão expostas pelas tools do MCP.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const next = new Set<string>(mcpSkills.map((s) => s.id));
                      setMcpAllowedSkillIds(next);
                    }}
                    disabled={mcpLoading || mcpSkills.length === 0}
                    className="bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-white px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    MARCAR TODAS
                  </button>
                  <button
                    onClick={() => setMcpAllowedSkillIds(new Set())}
                    disabled={mcpLoading || mcpSkills.length === 0}
                    className="bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-white px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    LIMPAR
                  </button>
                  <button
                    onClick={handleSaveMcpSkills}
                    disabled={mcpLoading || !mcpConnection}
                    className="bg-cyber-cyan/20 border border-cyber-cyan/40 hover:bg-cyber-cyan/30 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    SALVAR
                  </button>
                </div>
              </div>

              <div className="mt-4 border border-cyber-border rounded-xl overflow-hidden">
                {mcpLoading ? (
                  <div className="p-6 text-center text-gray-400 text-sm flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Carregando...
                  </div>
                ) : mcpSkills.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    Nenhuma skill encontrada para sua conta.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto">
                    {mcpSkills.map((s) => {
                      const checked = mcpAllowedSkillIds.has(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-start gap-3 px-4 py-3 border-b border-cyber-border/60 hover:bg-cyber-border/20 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            onChange={() => handleToggleMcpSkill(s.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm text-white font-bold truncate">{s.title}</p>
                              <span className="text-[10px] font-mono text-gray-400 truncate max-w-[160px]">
                                {s.category || 'Uncategorized'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{s.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {!mcpConnection && (
                <div className="mt-4 text-xs text-cyber-orange font-mono">
                  Gere um token antes de salvar a lista de skills do MCP.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
