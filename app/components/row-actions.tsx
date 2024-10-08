import { Box, IconButton } from "@mui/material";
import { useRef } from "react";

import { ArrowMenuTopCenter } from "@/components/arrow-menu";
import { MenuActionItem, MenuActionProps } from "@/components/menu-action-item";
import useDisclosure from "@/components/use-disclosure";
import { Icon } from "@/icons";

type ActionsProps = {
  actions: MenuActionProps[];
};

export const RowActions = (props: ActionsProps) => {
  const { actions } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuDisclosure = useDisclosure();
  const { isOpen, open, close } = menuDisclosure;

  const [primaryAction, ...rest] = actions;
  return (
    <Box gap="0.5rem" display="flex" alignItems="center">
      <MenuActionItem
        as="button"
        {...primaryAction}
        {...(primaryAction.type === "button" ? { onDialogClose: close } : {})}
      />
      <IconButton ref={buttonRef} onClick={isOpen ? close : open}>
        <Icon name="more" size={16} />
      </IconButton>
      <ArrowMenuTopCenter
        onClose={close}
        open={isOpen}
        anchorEl={buttonRef.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
      >
        {rest.map((props, i) => (
          <MenuActionItem
            as="menuitem"
            key={i}
            {...props}
            onClick={() => {
              if (!props.stayOpen) {
                menuDisclosure.close();
              }
              return props.onClick?.();
            }}
            {...(props.type === "button" ? { onDialogClose: close } : {})}
          />
        ))}
      </ArrowMenuTopCenter>
    </Box>
  );
};
