import React, { useState, useRef, useEffect } from 'react';
import { Upload, ZoomIn, ZoomOut, Save, User as UserIcon, Mail, Calendar, Shield, Loader2, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { uploadAvatar, getSignedAvatarUrl, getPublicAvatarUrl } from '../services/avatarService';
import { User as UserType } from '../types';

interface SettingsPageProps {
  user: UserType | null;
}

type TabType = 'profile' | 'mcp';
type ToastKind = 'success' | 'error';

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [role, setRole] = useState<string>('User');
  const [profileAvatarPathOrUrl, setProfileAvatarPathOrUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: ToastKind; title: string; message?: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const avatarPreviewRef = useRef<string | null>(null);
  const isUploadingRef = useRef(false);
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

  useEffect(() => {
    isUploadingRef.current = isUploading;
  }, [isUploading]);

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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (previewObjectUrlRef.current) {
          URL.revokeObjectURL(previewObjectUrlRef.current);
          previewObjectUrlRef.current = null;
        }
        setAvatarPreview(reader.result as string);
        setAvatarScale(1.2);
        setAvatarPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const clampPosition = (x: number, y: number, scale: number) => {
    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return { x, y };

    const radius = rect.width / 2;
    const maxOffset = radius * (scale - 1);

    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, x)),
      y: Math.max(-maxOffset, Math.min(maxOffset, y)),
    };
  };

  const handleZoomIn = () => {
    setAvatarScale((prev) => {
      const next = Math.min(prev + 0.1, 3);
      setAvatarPosition((p) => clampPosition(p.x, p.y, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setAvatarScale((prev) => {
      const next = Math.max(prev - 0.1, 1);
      setAvatarPosition((p) => clampPosition(p.x, p.y, next));
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!avatarPreview || isUploading) return;
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX - avatarPosition.x, y: e.clientY - avatarPosition.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    const clamped = clampPosition(newX, newY, avatarScale);
    setAvatarPosition(clamped);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!avatarPreviewRef.current || isUploadingRef.current) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      setAvatarScale((prev) => {
        const next = Math.max(1, Math.min(3, prev + direction * 0.1));
        setAvatarPosition((p) => clampPosition(p.x, p.y, next));
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const exportCroppedAvatar = async (): Promise<Blob | null> => {
    if (!avatarPreview || !editorRef.current) return null;

    let imgSrc = avatarPreview;
    
    const img = new Image();
    
    if (avatarFile) {
      imgSrc = URL.createObjectURL(avatarFile);
    }
    
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
    });

    const outputSize = 512;
    const rect = editorRef.current.getBoundingClientRect();
    const factor = rect.width ? outputSize / rect.width : 2;

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const coverScale = Math.max(outputSize / img.width, outputSize / img.height);
    const baseW = img.width * coverScale;
    const baseH = img.height * coverScale;

    const userScale = avatarScale;
    const drawW = baseW * userScale;
    const drawH = baseH * userScale;

    const dx = avatarPosition.x * factor;
    const dy = avatarPosition.y * factor;

    const x = (outputSize - drawW) / 2 + dx;
    const y = (outputSize - drawH) / 2 + dy;

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.drawImage(img, x, y, drawW, drawH);

    if (avatarFile) {
      URL.revokeObjectURL(imgSrc);
    }

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png', 0.92);
    });
  };

  const handleUploadAvatar = async () => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      const blob = await exportCroppedAvatar();
      if (!blob) {
        showToast('error', 'Falha no upload do avatar', 'Não foi possível processar a imagem do avatar.');
        setIsUploading(false);
        return;
      }

      const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
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

      let avatarUrlToStore = path;
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars');
        if (!bucketError && bucketData?.public) {
          const { url: publicUrl } = getPublicAvatarUrl(path);
          if (publicUrl) {
            avatarUrlToStore = publicUrl;
          }
        }
      } catch {
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrlToStore })
        .eq('id', user.id);

      if (updateError) {
        showToast('error', 'Falha ao salvar avatar', updateError.message);
        setIsUploading(false);
        return;
      }

      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
      previewObjectUrlRef.current = URL.createObjectURL(blob);

      setAvatarPreview(previewObjectUrlRef.current);
      setProfileAvatarPathOrUrl(avatarUrlToStore);
      setAvatarFile(null);
      setIsDragging(false);
      setAvatarScale(1);
      setAvatarPosition({ x: 0, y: 0 });
      setIsUploading(false);
      showToast('success', 'Avatar salvo', 'Seu avatar foi atualizado.');
    } catch (e: any) {
      showToast('error', 'Falha no upload do avatar', e?.message || 'Não foi possível enviar o avatar.');
      setIsUploading(false);
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

  const handleResetAvatar = () => {
    setProfileAvatarPathOrUrl(user?.avatar || null);
    setAvatarFile(null);
    setAvatarScale(1);
    setAvatarPosition({ x: 0, y: 0 });
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
                  <div
                    ref={editorRef}
                    className="relative w-64 h-64 bg-cyber-dark rounded-full overflow-hidden border border-cyber-border select-none touch-none mx-auto"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{ touchAction: 'none' }}
                  >
                    {avatarPreview ? (
                      <img
                        ref={imgRef}
                        src={avatarPreview}
                        alt="Avatar preview"
                        className={`absolute inset-0 w-full h-full object-cover ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        draggable={false}
                        style={{
                          transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarScale})`,
                          transformOrigin: 'center center',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <UserIcon size={64} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleZoomOut}
                        disabled={!avatarPreview || isUploading}
                        className="p-2 bg-cyber-dark border border-cyber-border rounded hover:bg-cyber-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut size={18} />
                      </button>
                      <span className="text-xs text-gray-500 font-mono">{Math.round(avatarScale * 100)}%</span>
                      <button
                        onClick={handleZoomIn}
                        disabled={!avatarPreview || isUploading}
                        className="p-2 bg-cyber-dark border border-cyber-border rounded hover:bg-cyber-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn size={18} />
                      </button>
                    </div>
                    <button
                      onClick={handleResetAvatar}
                      disabled={!avatarPreview || isUploading}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-white py-2 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={18} className="mr-2" />
                    {isUploading ? 'Uploading...' : 'Select Image'}
                  </button>
                  <button
                    onClick={handleUploadAvatar}
                    disabled={!avatarPreview || isUploading}
                    className="flex-1 bg-cyber-blue hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(45,96,255,0.39)]"
                  >
                    {isUploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Avatar
                      </>
                    )}
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
          <div className="bg-cyber-panel/50 border border-cyber-border rounded-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-cyber-dark rounded-lg flex items-center justify-center">
              <Shield size={40} className="text-cyber-cyan" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">MCP Configuration</h3>
            <p className="text-gray-400 mb-2">MCP (Model Context Protocol) settings are under development.</p>
            <p className="text-sm text-cyber-cyan font-mono">Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
