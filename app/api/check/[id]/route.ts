import { NextRequest, NextResponse } from "next/server"

export const GET = ( request: NextRequest, { params }: { params: {id: string}} ) => {
    return NextResponse.json({ message: `Your user identification number is ${params.id}` })
}