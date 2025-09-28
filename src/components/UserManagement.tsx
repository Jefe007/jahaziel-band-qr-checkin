import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus, Shield, Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  user_roles: {
    role: 'super_admin' | 'admin' | 'registrations_manager' | 'checkin_operator' | 'user';
  }[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'checkin_operator' as 'super_admin' | 'admin' | 'registrations_manager' | 'checkin_operator'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get user roles for each profile
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            user_roles: rolesData || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Email y contraseña son requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      // Call the edge function to create the user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          displayName: newUser.displayName
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast({
        title: "Éxito",
        description: "Usuario creado correctamente"
      });

      setNewUser({
        email: '',
        password: '',
        displayName: '',
        role: 'checkin_operator'
      });
      setCreateModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: `No se pudo crear el usuario: ${error.message || 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const { error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'registrations_manager': return 'bg-blue-100 text-blue-800';
      case 'checkin_operator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'registrations_manager': return 'Gestor de Registros';
      case 'checkin_operator': return 'Operador Check-in';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'registrations_manager': return <Eye className="h-3 w-3" />;
      case 'checkin_operator': return <Users className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Contraseña segura"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Nombre (Opcional)</Label>
                <Input
                  id="displayName"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkin_operator">Operador Check-in</SelectItem>
                    <SelectItem value="registrations_manager">Gestor de Registros</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createUser}>
                  Crear Usuario
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{user.display_name || user.email}</h3>
                    {user.user_roles.map((roleObj, index) => (
                      <Badge
                        key={index}
                        className={`${getRoleColor(roleObj.role)} flex items-center gap-1`}
                      >
                        {getRoleIcon(roleObj.role)}
                        {getRoleLabel(roleObj.role)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Creado: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteUser(user.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay usuarios creados
        </div>
      )}
    </div>
  );
};

export default UserManagement;