import Filter from "@/Components/InventoryPage/Filter/Filter";
import PhoneFilterTab from "@/Components/InventoryPage/Filter/PhoneFilterTab";
import ObjectInventory from "@/Components/InventoryPage/ObjectInventory/ObjectInventory";
import Top from "@/Components/InventoryPage/Top/Top";


export default function Page() {

    // backend call for content of the page

    return <div className="h-full w-full flex flex-col gap-y-5 px-4 sm:px-6 md:px-10 lg:px-20">
        <Top />
        <PhoneFilterTab />
        <div className="flex flex-col lg:flex-row justify-between gap-y-6 lg:gap-x-6 lg:pt-10" >
            <Filter />
            <ObjectInventory products={[]} />
        </div>
    </div>
}