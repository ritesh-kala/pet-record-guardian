
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Key, Mail, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, updateUserProfile, logout, resetPassword } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get user name from metadata
  const userName = currentUser?.user_metadata?.full_name || '';
  const [displayName, setDisplayName] = useState(userName);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (displayName.trim() === '') {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await updateUserProfile({ full_name: displayName });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated."
      });
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleResetPassword = async () => {
    if (currentUser?.email) {
      try {
        await resetPassword(currentUser.email);
        toast({
          title: "Password reset email sent",
          description: "Check your email for instructions to reset your password."
        });
      } catch (error) {
        console.error('Password reset error:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <SectionHeader 
          title="My Profile" 
          description="Manage your account details"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Name</Label>
                        <Input 
                          id="displayName" 
                          value={displayName} 
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setDisplayName(userName);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? 'Updating...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-medium">Account Information</h3>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="font-medium">{userName || 'Not set'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p>{currentUser?.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Account Security</h3>
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Password</p>
                    <p>••••••••</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleResetPassword}
                >
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
