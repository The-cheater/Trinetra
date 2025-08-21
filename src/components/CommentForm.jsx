import { useState, useEffect } from 'react';
import { 
  PopoverForm, 
  PopoverFormButton, 
  PopoverFormCutOutLeftIcon, 
  PopoverFormCutOutRightIcon, 
  PopoverFormSeparator, 
  PopoverFormSuccess 
} from './PopoverForm';

export const CommentForm = ({ open, setOpen, incidentTitle }) => {
  const [formState, setFormState] = useState("idle");
  const [comment, setComment] = useState("");

  function submit() {
    setFormState("loading");
    setTimeout(() => {
      setFormState("success");
    }, 1500);

    setTimeout(() => {
      setOpen(false);
      setFormState("idle");
      setComment("");
    }, 3300);
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter" &&
        open &&
        formState === "idle"
      ) {
        submit();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, formState, setOpen]);

  return (
    <PopoverForm
      title={`Comment on: ${incidentTitle}`}
      open={open}
      setOpen={setOpen}
      width="364px"
      height="192px"
      showCloseButton={formState !== "success"}
      showSuccess={formState === "success"}
      openChild={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim()) return;
            submit();
          }}
        >
          <div style={{ position: 'relative' }}>
            <textarea
              autoFocus
              placeholder="Add your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                height: '128px',
                width: '100%',
                resize: 'none',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                outline: 'none',
                border: 'none',
                backgroundColor: 'var(--twitter-background)',
                color: 'var(--twitter-black)',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>
          <div style={{ position: 'relative', display: 'flex', height: '48px', alignItems: 'center', padding: '0 10px' }}>
            <PopoverFormSeparator />
            <div style={{ position: 'absolute', left: '0', top: '0', transform: 'translateX(-1.5px) translateY(-50%)' }}>
              <PopoverFormCutOutLeftIcon />
            </div>
            <div style={{ position: 'absolute', right: '0', top: '0', transform: 'translateX(1.5px) translateY(-50%) rotate(180deg)' }}>
              <PopoverFormCutOutRightIcon />
            </div>
            <PopoverFormButton
              loading={formState === "loading"}
              text="Post Comment"
            />
          </div>
        </form>
      }
      successChild={
        <PopoverFormSuccess
          title="Comment Posted!"
          description="Your comment has been successfully added to the discussion."
        />
      }
    />
  );
};
