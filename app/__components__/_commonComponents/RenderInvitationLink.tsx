"use client"
import { copyToClipboard } from "@/lib/helpers/copyText"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { ShareOutlined } from "@mui/icons-material"
import { Box, IconButton, InputAdornment, SxProps, TextField } from "@mui/material"
import { useContext } from "react"
import { MdContentCopy } from "react-icons/md"

export const RenderInvitationLink: React.FC<{ sx?: SxProps }> = ({ sx }) => {
    const { userInfo } = useContext(USER_CONTEXT);

    return (
        <Box display={'flex'} mt={1} bgcolor={'white'} sx={{ ...sx }} borderRadius={1}>
            <div className="flex items-center pl-2 justify-center" >
                <ShareOutlined fontSize="small" />
            </div>
            <Box flex={1} onClick={() => copyToClipboard(`${ window?.location.origin }/getting-started?type=signup&invitedBy=${ userInfo.InvitationCode }`)}>
                <TextField
                    value={`${ window?.location.origin }/getting-started?type=signup&invitedBy=${ userInfo.InvitationCode }`}
                    fullWidth
                    size='small'
                    sx={{ pointerEvents: 'none', '& fieldset': { display: 'none' } }}
                    slotProps={{
                        input: {
                            style: { fontSize: 10 },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton className=' bg-inherit pl-3'>
                                        <MdContentCopy fontSize={15} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </Box>
        </Box>
    )
}