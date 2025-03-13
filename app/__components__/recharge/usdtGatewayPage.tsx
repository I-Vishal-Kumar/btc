import { AdminConfigType } from "@/__types__/admin.types";
import { FaRegCopy } from "react-icons/fa6";
import { IoQrCodeOutline } from "react-icons/io5";
import Image from "next/image"
import { ChangeEvent, Suspense, useContext, useEffect, useState } from "react"
import { copyToClipboard } from "@/lib/helpers/copyText";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { FileUpload } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { UploadFile } from "./defaultGatewayPage";
import { useMutation } from "@tanstack/react-query";
import { USDT } from "@/(backend)/services/transaction.service.serve";
import { USER_CONTEXT } from "@/lib/hooks/user.context";
import { useRouter } from "next/navigation";

export const UsdtGateway: React.FC<{ amount: number, config: AdminConfigType }> = ({ amount, config }) => {

    const [transactionId, setTransactionId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileURL, setFileURL] = useState<string>("");

    const { userInfo } = useContext(USER_CONTEXT);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length) {
            setFile(event.target.files[0]);
            if (fileURL) {
                URL.revokeObjectURL(fileURL);
            }
            setFileURL(URL.createObjectURL(event.target.files[0]));
        }
    };

    const { data, isSuccess, isPending, mutate } = useMutation({
        mutationFn: async () => {
            const isUploaded = await UploadFile(file, userInfo.PhoneNumber);
            if (!isUploaded) {
                enqueueSnackbar("File upload failed. Please try again.", { variant: "error" });
                return { msg: 'Failed to upload file this time', valid: false } // Prevents BTC function from running
            }
            return USDT(amount, transactionId, 'USDT')
        }
    })

    const handleSubmit = () => mutate()
    const router = useRouter();

    useEffect(() => {
        if (isSuccess && data.valid) {

            enqueueSnackbar(data.msg, { variant: "success" });

            setTimeout(() => {
                router.back();
            }, 1000 * 2);

        } else if (isSuccess) {
            enqueueSnackbar(data.msg || "Something went wrong", { variant: "error" });
        }
    }, [isSuccess, isPending]);

    return (
        <div className="absolute top-0 left-0 w-full p-6 bg-white mx-auto">
            <div className="w-[90%] h-full mx-auto mt-[2rem] ">
                <div className="flex justify-between text-[.6rem] ">
                    <p>Secure</p>
                    <p className="flex place-items-center ">
                        <Image src={'/assets/uniPayment.png'} alt="..." width={80} height={50} />
                    </p>
                </div>

                <div className=" bg-[#fff] mt-2 px-2 rounded-lg py-1 flex justify-between text-[0.6rem] ">
                    <div className=" ">
                        <p className="font-[500] text-[#000000d3] ">
                            Order <span># {Math.floor(Math.random() * 100000)}</span>
                        </p>
                        <p className="font-light text-[gray] ">BTC</p>
                    </div>
                    <div>
                        <Suspense>
                            <RechargeAmount amount={amount} />
                        </Suspense>
                    </div>
                </div>

                <div className="w-full h-min bg-[#FFF] mt-4  rounded-2xl p-3 ">
                    <span className="flex place-items-center font-[500] text-[.65rem] text-[#000000d3]  ">
                        <IoQrCodeOutline className="mr-1 text-[#000000d3] " /> Scan QR
                        code{" "}
                    </span>

                    <div className="w-[40vw] h-[25vh] grid place-items-center mr-auto ml-auto my-3 ">
                        <Image
                            src={'/assets/usdt.jpg'}
                            alt="barCode"
                            width={100}
                            height={100}
                            className="object-contain w-auto h-[95%]  "
                        />
                    </div>

                    <div className="flex justify-between ">
                        <div className="w-[30%] ">
                            <span className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">
                                Network
                            </span>
                            <button
                                className="py-1 flex place-items-center justify-center w-[80%] rounded-md "
                            >
                                <Image src={'/assets/usdtNetwork.png'} alt="..." width={15} height={15} unoptimized className="mr-1.5 " />
                                <p className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">TRC20</p>
                            </button>
                        </div>

                        <div className="w-[30%] ">
                            <span className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">
                                Coin
                            </span>
                            <button className="py-1 flex place-items-center justify-center w-[80%] rounded-md ">
                                <Image src={'/assets/usdtcoln.png'} alt="..." width={15} height={15} unoptimized className="mr-1.5" />
                                <p className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">USDT</p>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 ">
                    <p className="font-[500] text-[.7rem] ">Deposit Address</p>
                    <div className="flex justify-between rounded-lg bg-transparent border-2 border-[#2885F6] p-2 ">
                        <input
                            type="text"
                            placeholder="Enter Your Deposit Address"
                            value={config.UsdtAddress || ""}
                            disabled
                            readOnly
                            className="w-[80%] bg-transparent text-[.65rem] "
                        />
                        <FaRegCopy
                            onClick={() => copyToClipboard(config.UsdtAddress)}
                            className="text-[#2885F6] "
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div className="flex justify-between py-2 overflow-hidden">

                    <div>
                        <p className="my-2 mt-4">Upload Payment Screenshot</p>
                        <label className="bg-slate-200 ring-1 ring-slate-300 cursor-pointer border rounded-full flex w-fit items-center gap-x-2 justify-center px-4 py-2 mb-4">
                            <p>Click here/Choose File</p>
                            <FileUpload />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    {
                        fileURL && (
                            <Image src={fileURL} alt="screenshort" height={200} width={100} />
                        )
                    }

                </div>
                <div className="mt-4 ">
                    <p className="font-[500] text-[.7rem] ">Transaction Id</p>
                    <div className="flex justify-between rounded-lg bg-transparent border-2 border-[#2885F6] p-2 ">
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Paste here your Transaction Id"
                            className="w-[80%] bg-transparent text-[.65rem] "
                        />
                        <FaRegCopy
                            onClick={() => copyToClipboard(transactionId)}
                            className="text-[#2885F6] "
                        />
                    </div>
                </div>

                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSubmit}
                    className="bg-[#2885F6] w-full text-center p-3 mt-4 rounded-lg flex justify-center place-items-center text-[#fff] text-[.7rem] "
                >
                    Recharge
                </button>
            </div>
        </div>
    )
}


function RechargeAmount({ amount }: { amount: number }) {

    return (
        <div className="flex  items-center  ">
            <p className="ml-1 text-[.65rem] font-[500] text-[#000000d3] ">
                ${formatNumber(amount / 89)}
            </p>
            <p className="ml-1 text-[.65rem] font-[500] text-[#000000d3] ">(USDT)</p>
        </div>
    );
}
