import Board from "../board/Board"

function Container() {
    return (
        <div className="w-full h-full fixed bg-black p-5">
            <div className="w-[90%] h-[90%] mx-20 mt-5 bg-white">
                <Board />
            </div>
        </div>
    )
}

export default Container