const express = require('express');
const router = express.Router();

router.post('/simulate', async (req, res) => {
    try {
        const { email, method } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email é obrigatório para o pagamento' });
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        const transactionId = 'TX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

        res.json({
            success: true,
            message: 'Pagamento processado com sucesso!',
            data: {
                transactionId,
                email,
                method: method || 'multicaixa',
                amount: 1500,
                currency: 'AOA',
                status: 'completed',
                approvedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Erro no pagamento:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar pagamento: ' + error.message });
    }
});

module.exports = router;