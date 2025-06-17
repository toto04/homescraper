import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { StickyNote, Save } from "lucide-react"
import { updateListingNotes } from "../lib/data"
import type { CombinedListing } from "../../types"

interface NotesEditorProps {
  listing: CombinedListing
  onNotesUpdate?: () => void
  children: React.ReactNode
}

export function NotesEditor({
  listing,
  onNotesUpdate,
  children,
}: NotesEditorProps) {
  const [notes, setNotes] = useState(listing.userActions?.notes || "")
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateListingNotes(listing.id, notes)
    if (success) {
      setIsOpen(false)
      if (onNotesUpdate) {
        onNotesUpdate()
      }
    }
    setIsSaving(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <StickyNote className="w-5 h-5 mr-2" />
            Note per "{listing.title.substring(0, 30)}..."
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Aggiungi le tue note per questo annuncio..."
            className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salva Note"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Annulla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
