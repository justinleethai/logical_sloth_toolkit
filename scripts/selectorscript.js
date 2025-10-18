    const cardTypeMap = {
      VI: '001',
      MC: '002',
      AX: '003',
      PPL: '999',
      KLI: '998'
    };

    document.getElementById('gatewayForm').addEventListener('submit', function(e) {
      e.preventDefault();

      const acct_subtype = document.getElementById('paymentType').value;
      const ap_payment_type = acct_subtype;
      const currency = document.getElementById('currency').value;
      const card_type = cardTypeMap[acct_subtype];
      const selector = document.getElementById('selector').value;

      const REQ = { acct_subtype, ap_payment_type, currency, card_type };

      const gateway = evaluateSelector(selector, REQ);
      document.getElementById('result').textContent = `Routed to: ${gateway}`;
    });

    function evaluateSelector(selector, REQ) {
      const parts = selector.split(',');
      let defaultGateway = parts[parts.length - 1];
      let matchedGateway = null;
      let debugOutput = `Evaluating with REQ: ${JSON.stringify(REQ, null, 2)}\n\n`;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const [condition, gateway] = part.split(':');

        if (!gateway) continue;

        let expr = condition.replace(/\{REQ\.(\w+)\}/g, (_, key) => {
          return `"${REQ[key]}"`;
        });

        expr = expr
          .replace(/=/g, '===')
          .replace(/\|/g, '||')
          .replace(/&/g, '&&')
          .replace(/(?<!")\b([A-Z0-9]+)\b(?!")/g, '"$1"'); // Quote unquoted literals

        debugOutput += `Rule ${i + 1}: ${condition} => ${expr}\n`;

        try {
          if (eval(expr)) {
            matchedGateway = gateway;
            debugOutput += `Matched: ${gateway}\n---\n`;
            break;
          } else {
            debugOutput += `Not matched\n---\n`;
          }
        } catch (err) {
          debugOutput += `Error evaluating: ${err.message}\n---\n`;
        }
      }

      debugOutput += `Final Gateway: ${matchedGateway || defaultGateway}`;
      document.getElementById('debug').textContent = debugOutput;

      return matchedGateway || defaultGateway;
    }