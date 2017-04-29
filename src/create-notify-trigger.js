const createNotifyTrigger = async function ({client, key}) {
  try {
    const text = `
      CREATE OR REPLACE FUNCTION notify_trigger()
      RETURNS TRIGGER AS
      $body$
      DECLARE
      BEGIN
        PERFORM pg_notify('watchers', 'table=' || TG_TABLE_NAME || '&pkey=' || NEW.${key});
        RETURN NEW;
      END;
      $body$
      LANGUAGE plpgsql;
    `;

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default createNotifyTrigger;
