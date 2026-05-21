import { MenuItem } from "@headlessui/react";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface BannedProps {
  setShowModal: (show: boolean) => void;
}

const Banned = ({ setShowModal }: BannedProps) => {
  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={(event) => {
        stopEventPropagation(event);
        setShowModal(true);
      }}
    >
      <div className="flex items-center space-x-2">
        <NoSymbolIcon className="size-4" />
        <div>Banned accounts</div>
      </div>
    </MenuItem>
  );
};

export default Banned;
