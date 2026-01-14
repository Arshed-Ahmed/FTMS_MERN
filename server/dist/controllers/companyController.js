import Company from '../models/Company.js';
// @desc    Get company settings
// @route   GET /api/company
// @access  Private
export const getCompany = async (req, res) => {
    try {
        let company = await Company.findOne();
        if (!company) {
            // Create default company if none exists
            company = await Company.create({
                name: 'My Tailor Shop'
            });
        }
        res.json(company);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update company settings
// @route   PUT /api/company
// @access  Private
export const updateCompany = async (req, res) => {
    try {
        const { name, address, city, regNo, phone, email, website, budget, targetEmployees, targetOrders } = req.body;
        let company = await Company.findOne();
        if (company) {
            company.name = name || company.name;
            company.address = address || company.address;
            company.city = city || company.city;
            company.regNo = regNo || company.regNo;
            company.phone = phone || company.phone;
            company.email = email || company.email;
            company.website = website || company.website;
            company.budget = budget || company.budget;
            company.targetEmployees = targetEmployees || company.targetEmployees;
            company.targetOrders = targetOrders || company.targetOrders;
            const updatedCompany = await company.save();
            res.json(updatedCompany);
        }
        else {
            // Should not happen if getCompany is called first or logic ensures creation
            const newCompany = await Company.create(req.body);
            res.status(201).json(newCompany);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
