import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            {/* ...existing links... */}
            <Link to="/add-equipment-category">Add Equipment Category</Link>
        </nav>
    );
}

export default Navbar;