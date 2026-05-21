import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { memo, useState } from "react";
import LowSignalNotificationToggle from "@/components/Shared/Settings/LowSignalNotificationToggle";
import { Modal, Tooltip } from "@/components/Shared/UI";

const Settings = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Tooltip content="Notification settings">
        <button
          className="rounded-lg p-2 text-gray-500 outline-hidden hover:bg-gray-200 hover:text-gray-900 focus:bg-gray-200 focus:text-gray-900 dark:text-gray-200 dark:focus:bg-gray-800 dark:focus:text-white dark:hover:bg-gray-800 dark:hover:text-white"
          onClick={() => setShowSettings(true)}
          type="button"
        >
          <Cog6ToothIcon className="size-5" />
        </button>
      </Tooltip>
      <Modal
        onClose={() => setShowSettings(false)}
        show={showSettings}
        title="Notification settings"
      >
        <div className="p-5">
          <LowSignalNotificationToggle />
        </div>
      </Modal>
    </>
  );
};

export default memo(Settings);
