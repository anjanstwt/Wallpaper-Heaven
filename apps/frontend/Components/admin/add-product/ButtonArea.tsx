import Button from "@/Components/ui/Button";

export default function ButtonArea() {

    const handleClick = () => {
        console.log("handle click")
    }

    return <div className="w-full flex justify-center sm:justify-start">
        <Button onClick={handleClick}>Submit</Button>
    </div>
}