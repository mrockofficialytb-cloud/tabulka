import{ImageResponse}from"next/og";
export const size={width:512,height:512};export const contentType="image/png";
export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#f7f8f9"}}><img src="https://goluj.cz/logos/ico.svg" width="360" height="355" style={{objectFit:"contain"}}/></div>,{...size})}
