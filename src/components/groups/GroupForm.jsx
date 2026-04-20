import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import { createGroup } from "../../services/groups.js";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import MemberSelector from "./MemberSelector.jsx";
import { Users, FileText } from "lucide-react";

function GroupForm({ onSuccess, onCancel }) {
  const { currentUser, userProfile } = useContext(AuthContext);
  const toast = useToast();

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = groupName.trim();
  const hasValidName = trimmedName.length > 0;
  const hasEnoughMembers = selectedMembers.length >= 1;
  const isFormValid = hasValidName && hasEnoughMembers;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const groupData = {
        name: trimmedName,
        description: groupDescription.trim(),
        invitedMembers: selectedMembers,
      };

      const createdGroup = await createGroup(groupData, {
        uid: currentUser.uid,
        displayName: userProfile?.displayName ?? "",
        email: userProfile?.email ?? "",
        photoURL: userProfile?.photoURL ?? null,
        upiId: userProfile?.upiId ?? "",
      });

      toast.success(`"${trimmedName}" created successfully!`);
      onSuccess?.(createdGroup);
    } catch (error) {
      toast.danger(error?.message ?? "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Group Name"
        placeholder="e.g., Goa Trip, Hostel Room 204"
        value={groupName}
        onChange={(event) => setGroupName(event.target.value)}
        leftIcon={<Users className="w-4 h-4" />}
        error={groupName.length > 0 && !hasValidName ? "Group name is required" : undefined}
      />

      <Input
        label="Description (optional)"
        placeholder="What's this group for?"
        value={groupDescription}
        onChange={(event) => setGroupDescription(event.target.value)}
        variant="textarea"
        leftIcon={<FileText className="w-4 h-4" />}
      />

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Add Members
        </label>
        <MemberSelector
          selectedMembers={selectedMembers}
          onMembersChange={setSelectedMembers}
          currentUserUid={currentUser?.uid}
        />
        {selectedMembers.length === 0 && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            Add at least one other member to create a group
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={!isFormValid}
          isLoading={isSubmitting}
          fullWidth
        >
          Create Group
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            fullWidth
            className="px-4 py-2 text-[#1F2937] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-medium"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default GroupForm;
