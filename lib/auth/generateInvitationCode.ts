export function getInvitationCode(length = 8) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    // Convert each byte to a digit (0-9) by taking modulo 10
    return Array.from(array, byte => (byte % 10)).join('');
}