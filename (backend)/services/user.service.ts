import { OperationTypes, ServiceReturnType } from "@/__types__/service.types";
import { UserType } from "@/__types__/user.types";


export class USER_SERVICE {

    static getUser = async (): ServiceReturnType<UserType | null> => {
        try {
            
            // const { data = null } = await axios.get('/api/user-details');
            
            // if(!data) throw new Error('Something went wrong while getting user details');

            // // we have some data.
            // if(data.operation === OperationTypes.LOGOUT ) throw new Error ('Session Expired');
            console.log('called')
            await new Promise((resolve, rejects) => {
                setTimeout(resolve, 1000 * 5);
            })
            return {valid: true, data: null};

        } catch (error: unknown) {
            
            if( error instanceof Error) console.log(error.message)

            return {valid: false, operation: OperationTypes.LOGOUT, msg: 'Login session expired.'} ;
        
        }

    }


}
