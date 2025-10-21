// src/pages/Coordination.tsx
import { useParams } from "react-router-dom"
import CoordinationEditor from "../components/CoordinationEditor"

export default function Coordination() {
    const { id } = useParams<{ id: string }>()
    return (
        <div>
            <h1>コーディネート編集</h1>
            <CoordinationEditor coordinationId={Number(id)} />
        </div>
    )
}