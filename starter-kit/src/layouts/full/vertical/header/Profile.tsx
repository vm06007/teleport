import { Icon } from "@iconify/react";
import { Badge, Dropdown } from "flowbite-react";
import * as profileData from "./Data";
import SimpleBar from "simplebar-react";
import { Link } from "react-router";
const Profile = () => {
  return (
    <div className="relative ">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] pb-4 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-1">
            <span className="h-10 w-10 hover:text-primary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            </span>
            <Icon
              icon="solar:alt-arrow-down-bold"
              className="hover:text-primary dark:text-primary group-hover/menu:text-primary"
              height={12}
            />
          </div>
        )}
      >
        <SimpleBar>
          {profileData.profileDD.map((items, index) => (
            <div key={index} className="px-6 mb-2">
              <Dropdown.Item
                as={Link}
                to={items.url}
                className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md"
                key={index}
              >
                <div className="flex items-center w-full ">
                  <div className=" flex gap-3 w-full ">
                    <h5 className="text-15 font-normal group-hover/link:text-primary">
                      {items.title}
                    </h5>
                    {items.url == "/apps/invoice" ? (
                      <Badge color={"lightprimary"}>4</Badge>
                    ) : null}
                  </div>
                </div>
              </Dropdown.Item>
            </div>
          ))}
        </SimpleBar>
      </Dropdown>
    </div>
  );
};

export default Profile;
