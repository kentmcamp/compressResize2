import logo from '../assets/icon.png'

function Header() {

    return (
        <div className="header">
            <div className="logo-header">
                <img className="logo" src={logo} alt="Tauri Logo" />
            </div>
            <div className="title-header">
                <div className="main-title">
                    <h1>COMPRESS-RESIZE</h1>
                </div>
                <div className="sub-title">
                    <h2>Bulk Image Optimizer</h2>
                </div>
            </div>
        </div>
    )

}

export default Header
