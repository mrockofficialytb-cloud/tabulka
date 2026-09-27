import{ImageResponse}from"next/og";
export const size={width:1200,height:630};export const contentType="image/png";
export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#f7f8f9",padding:"90px"}}><img src="https://goluj.cz/logos/logo.svg" width="820" height="220" style={{objectFit:"contain"}}/></div>,{...size})}
