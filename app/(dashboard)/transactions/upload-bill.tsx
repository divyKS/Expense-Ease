import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp } from "lucide-react"
import { useRef } from "react"

type FileUploadProps = {
    onFileChange: (file: File | null) => void
}

export const UploadBill = ({ onFileChange }: FileUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleButtonClick = () => {
        // Trigger file input when button is clicked
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(e)
        // console.log(e.target)
        // console.log(e.target.files)
        const file = e.target.files?.[0] || null
        if (file && onFileChange) {
            onFileChange(file)
        }
    }

    return (
        <>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Button
                    onClick={handleButtonClick}
                    size="sm"
					className="w-full lg:w-auto"
                >
                    <FileUp className="mr-2 size-4"/>
                    Extract PDF or Image
                </Button>
                <input
                    id="extract"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        </>
    )
}