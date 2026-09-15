import Button from "@/components/ui/Button";

export default function ButtonArea() {

    const handleClick = () => {
        console.log("handle click")
    }

    return <div className="w-full flex justify-center sm:justify-start">
        <Button text="Submit" onClick={handleClick} />
    </div>
}