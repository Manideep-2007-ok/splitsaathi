import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import { isValidUpiId } from "../utils/upiHelper.js";
import { formatDate } from "../utils/formatters.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import { User, Mail, Smartphone, Save, Shield, Calendar, Loader2 } from "lucide-react";

function Profile() {
  const { currentUser, userProfile, loading, updateUserProfile } = useContext(AuthContext);
  const toast = useToast();
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? "");
  const [upiId, setUpiId] = useState(userProfile?.upiId ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = displayName.trim() !== (userProfile?.displayName ?? "") || upiId.trim() !== (userProfile?.upiId ?? "");
  const upiError = upiId.trim().length > 0 && !isValidUpiId(upiId.trim()) ? "Enter a valid UPI ID (e.g., name@upi)" : undefined;
  const isFormValid = displayName.trim().length > 0 && !upiError && hasChanges;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSaving) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ displayName: displayName.trim(), upiId: upiId.trim() });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.danger(error?.message ?? "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[Syne] tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden bg-[#18181B]/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="relative h-24 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="absolute -bottom-10 left-6">
            <Avatar
              src={userProfile?.photoURL}
              name={userProfile?.displayName}
              size="xl"
            />
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white font-[Syne]">
              {userProfile?.displayName ?? "User"}
            </h2>
            {userProfile?.upiId && (
              <Badge variant="success" size="sm" dot>
                UPI
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {userProfile?.email ?? ""}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl p-6 space-y-5 bg-[#18181B]/60 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <h3 className="text-base font-bold text-white font-[Syne] mb-4">
          Edit Profile
        </h3>

        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          placeholder="Your name"
          error={
            displayName.length > 0 && displayName.trim().length === 0
              ? "Name cannot be empty"
              : undefined
          }
        />

        <div className="relative">
          <Input
            label="Email"
            value={currentUser?.email ?? ""}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Email is managed by Google"
          />
          <Shield className="absolute right-3 top-9 w-4 h-4 text-gray-500" />
        </div>

        <Input
          label="UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          leftIcon={<Smartphone className="w-4 h-4" />}
          placeholder="yourname@upi"
          error={upiError}
          helperText={!upiError ? "Used for receiving settlements" : undefined}
        />

        <Button
          type="submit"
          disabled={!isFormValid}
          isLoading={isSaving}
          fullWidth
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </form>

      <div className="rounded-2xl p-6 bg-[#18181B]/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h3 className="text-base font-bold text-white font-[Syne] mb-4">
          Account Info
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Shield className="w-4 h-4 text-gray-400" />
              <span>Auth Provider</span>
            </div>
            <Badge variant="accent" size="sm">Google</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Member Since</span>
            </div>
            <span className="text-sm text-gray-200">
              {formatDate(userProfile?.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>UPI Status</span>
            </div>
            <Badge
              variant={userProfile?.upiId ? "success" : "warning"}
              size="sm"
              dot
            >
              {userProfile?.upiId ? "Connected" : "Not Set"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
