import ImageKit from 'imagekit';
import { NextResponse } from 'next/server';

  
  export async function GET () {
    const imagekit = new ImageKit({
        publicKey: "public_vqtKMKdE65ozlbDD5YOmev2NHuQ=", // Replace with your ImageKit public key
        privateKey: "private_C67/pJuClf2XA2CNN4mK5BnBxfk=", // Replace with your ImageKit private key
        urlEndpoint: "https://ik.imagekit.io/77htx0vcw", // Replace with your ImageKit endpoint
    });

    try {      
        const authParams = imagekit.getAuthenticationParameters();
        return NextResponse.json(authParams, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json({msg: 'Something went wrong'})
    }
}

  