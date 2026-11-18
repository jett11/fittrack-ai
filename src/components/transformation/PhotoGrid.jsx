import { useRef, useState } from 'react'
import { Camera, Trash2, Lock } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function PhotoGrid({ photos, onUpload, onDelete, uploading }) {
  const inputRef = useRef(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={17} className="text-primary" />
          <p className="text-sm font-semibold text-text">Progress photos</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <Lock size={12} /> Private to you
        </span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading…' : 'Upload a photo'}
      </Button>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-surface-2">
              {p.url && <img src={p.url} alt="" className="h-full w-full object-cover" />}
              <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1 text-center text-[0.65rem] text-white">
                {new Date(p.taken_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              {pendingDelete === p.id ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(p)
                      setPendingDelete(null)
                    }}
                    className="rounded-md bg-danger px-2 py-1 text-[0.65rem] font-semibold text-white"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="text-[0.65rem] text-white/80"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPendingDelete(p.id)}
                  aria-label="Delete photo"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
